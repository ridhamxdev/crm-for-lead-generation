import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { signToken, SESSION_COOKIE } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { name, email, password } = body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
  }

  const db = await getDb();

  // Check if email already exists
  const existing = await db.execute({
    sql: 'SELECT id FROM users WHERE email = ?',
    args: [email.toLowerCase()],
  });

  if (existing.rows.length > 0) {
    return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);

  const result = await db.execute({
    sql: 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    args: [name.trim(), email.toLowerCase(), hashed],
  });

  const userId = Number(result.lastInsertRowid);
  const token = await signToken({ userId, email: email.toLowerCase(), name: name.trim() });

  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  });

  return res;
}
