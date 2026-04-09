import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { signToken, SESSION_COOKIE } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const db = await getDb();

  const result = await db.execute({
    sql: 'SELECT id, name, email, password FROM users WHERE email = ?',
    args: [email.toLowerCase()],
  });

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password as string);

  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const token = await signToken({
    userId: user.id as number,
    email: user.email as string,
    name: user.name as string,
  });

  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year — persists across restarts until logout
    path: '/',
  });

  return res;
}
