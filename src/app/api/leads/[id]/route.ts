import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import type { Lead, UpdateLeadInput } from '@/types';

type RouteContext = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const n = parseInt(raw, 10);
  return isNaN(n) || n <= 0 ? null : n;
}

// ─── GET /api/leads/[id] ──────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: 'Invalid lead ID.' }, { status: 400 });

  try {
    const client = await getDb();
    const result = await client.execute({ sql: 'SELECT * FROM leads WHERE id = ?', args: [id] });
    const lead = result.rows[0] as unknown as Lead | undefined;

    if (!lead) return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    return NextResponse.json({ data: lead });
  } catch (err) {
    console.error('[GET /api/leads/:id]', err);
    return NextResponse.json({ error: 'Failed to fetch lead.' }, { status: 500 });
  }
}

// ─── PUT /api/leads/[id] ──────────────────────────────────────────────────────
export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: 'Invalid lead ID.' }, { status: 400 });

  try {
    const client = await getDb();
    const existingResult = await client.execute({ sql: 'SELECT * FROM leads WHERE id = ?', args: [id] });
    const existing = existingResult.rows[0] as unknown as Lead | undefined;
    if (!existing) return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });

    const body: UpdateLeadInput = await request.json();

    const setClauses: string[] = [];
    const args: (string | number | null)[] = [];

    if (body.name !== undefined) {
      if (!body.name.trim()) return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 });
      setClauses.push('name = ?');
      args.push(body.name.trim());
    }

    if (body.phone !== undefined) {
      const digits = body.phone.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 13)
        return NextResponse.json({ error: 'Phone number must be 10–13 digits.' }, { status: 400 });
      setClauses.push('phone = ?');
      args.push(body.phone.trim());
    }

    if (body.email !== undefined) {
      setClauses.push('email = ?');
      args.push(body.email?.trim() || null);
    }

    if (body.source !== undefined) {
      setClauses.push('source = ?');
      args.push(body.source);
    }

    if (body.status !== undefined) {
      setClauses.push('status = ?');
      args.push(body.status);
    }

    if (body.order_value !== undefined) {
      if (body.order_value !== null && (isNaN(Number(body.order_value)) || Number(body.order_value) < 0))
        return NextResponse.json({ error: 'Order value must be a positive number.' }, { status: 400 });
      setClauses.push('order_value = ?');
      args.push(body.order_value != null ? Number(body.order_value) : null);
    }

    if (body.notes !== undefined) {
      setClauses.push('notes = ?');
      args.push(body.notes?.trim() || null);
    }

    if (body.address !== undefined) {
      setClauses.push('address = ?');
      args.push(body.address?.trim() || null);
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ data: existing, message: 'Nothing to update.' });
    }

    args.push(id);
    await client.execute({ sql: `UPDATE leads SET ${setClauses.join(', ')} WHERE id = ?`, args });

    const updatedResult = await client.execute({ sql: 'SELECT * FROM leads WHERE id = ?', args: [id] });
    const updated = updatedResult.rows[0] as unknown as Lead;
    return NextResponse.json({ data: updated, message: 'Lead updated successfully.' });
  } catch (err) {
    console.error('[PUT /api/leads/:id]', err);
    return NextResponse.json({ error: 'Failed to update lead.' }, { status: 500 });
  }
}

// ─── DELETE /api/leads/[id] ───────────────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: 'Invalid lead ID.' }, { status: 400 });

  try {
    const client = await getDb();
    const existing = await client.execute({ sql: 'SELECT id FROM leads WHERE id = ?', args: [id] });
    if (!existing.rows[0]) return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });

    await client.execute({ sql: 'DELETE FROM leads WHERE id = ?', args: [id] });
    return NextResponse.json({ message: 'Lead deleted successfully.' });
  } catch (err) {
    console.error('[DELETE /api/leads/:id]', err);
    return NextResponse.json({ error: 'Failed to delete lead.' }, { status: 500 });
  }
}
