import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import type { CreateLeadInput, Lead, DashboardStats } from '@/types';

// ─── GET /api/leads ───────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const client = await getDb();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const search = searchParams.get('search');
    const stats = searchParams.get('stats');
    const month = searchParams.get('month'); // format: YYYY-MM

    // Return dashboard stats if ?stats=1
    if (stats === '1') {
      let statsSql = 'SELECT status, order_value FROM leads WHERE user_id = ?';
      const statsArgs: (string | number)[] = [session.userId];
      if (month) {
        statsSql += ' AND created_at LIKE ?';
        statsArgs.push(`${month}%`);
      }
      const rows = (await client.execute({ sql: statsSql, args: statsArgs }))
        .rows as unknown as { status: string; order_value: number | null }[];

      const result: DashboardStats = {
        total: rows.length,
        active: 0,
        closed: 0,
        rejected: 0,
        pipeline_value: 0,
        closed_value: 0,
        by_status: {},
      };

      const closedStatuses = new Set(['closed', 'order_complete']);
      const rejectedStatuses = new Set(['rejected']);
      const inactiveStatuses = new Set(['closed', 'order_complete', 'rejected']);

      for (const row of rows) {
        result.by_status[row.status] = (result.by_status[row.status] ?? 0) + 1;

        if (closedStatuses.has(row.status)) {
          result.closed++;
          result.closed_value += row.order_value ?? 0;
        } else if (rejectedStatuses.has(row.status)) {
          result.rejected++;
        }

        if (!inactiveStatuses.has(row.status)) {
          result.active++;
          result.pipeline_value += row.order_value ?? 0;
        }
      }

      return NextResponse.json({ data: result });
    }

    // Build query
    const conditions: string[] = ['user_id = ?'];
    const args: (string | number)[] = [session.userId];

    if (status && status !== 'all') {
      conditions.push('status = ?');
      args.push(status);
    }

    if (source && source !== 'all') {
      conditions.push('source = ?');
      args.push(source);
    }

    if (month) {
      conditions.push("created_at LIKE ?");
      args.push(`${month}%`);
    }

    if (search?.trim()) {
      conditions.push('(name LIKE ? OR phone LIKE ? OR email LIKE ? OR address LIKE ?)');
      const term = `%${search.trim()}%`;
      args.push(term, term, term, term);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const sql = `SELECT * FROM leads ${where} ORDER BY updated_at DESC`;

    const result = await client.execute({ sql, args });
    const leads = result.rows as unknown as Lead[];
    return NextResponse.json({ data: leads });
  } catch (err) {
    console.error('[GET /api/leads]', err);
    return NextResponse.json({ error: 'Failed to fetch leads.' }, { status: 500 });
  }
}

// ─── POST /api/leads ──────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body: CreateLeadInput = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }
    if (!body.phone?.trim()) {
      return NextResponse.json({ error: 'WhatsApp phone number is required.' }, { status: 400 });
    }

    const phoneDigits = body.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      return NextResponse.json({ error: 'Phone number must be 10–13 digits.' }, { status: 400 });
    }

    if (body.order_value != null) {
      if (isNaN(Number(body.order_value)) || Number(body.order_value) < 0) {
        return NextResponse.json({ error: 'Order value must be a positive number.' }, { status: 400 });
      }
    }

    const client = await getDb();

    const insertResult = await client.execute({
      sql: `INSERT INTO leads (user_id, name, phone, email, source, status, order_value, notes, address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        session.userId,
        body.name.trim(),
        body.phone.trim(),
        body.email?.trim() ?? null,
        body.source ?? 'other',
        body.status ?? 'new',
        body.order_value != null ? Number(body.order_value) : null,
        body.notes?.trim() ?? null,
        body.address?.trim() ?? null,
      ],
    });

    const newId = Number(insertResult.lastInsertRowid);
    const leadResult = await client.execute({ sql: 'SELECT * FROM leads WHERE id = ?', args: [newId] });
    const lead = leadResult.rows[0] as unknown as Lead;

    return NextResponse.json({ data: lead, message: 'Lead created successfully.' }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/leads]', err);
    return NextResponse.json({ error: 'Failed to create lead.' }, { status: 500 });
  }
}
