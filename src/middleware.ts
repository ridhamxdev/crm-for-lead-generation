import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { SESSION_COOKIE } from '@/lib/auth';

// Routes that don't require auth
const PUBLIC_PREFIXES = ['/', '/login', '/register', '/api/auth/'];

function getSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.JWT_SECRET ?? 'vg-crm-super-secret-jwt-key-2025-change-in-prod',
  );
}

function isPublic(pathname: string): boolean {
  // Exact match for landing page
  if (pathname === '/') return true;
  return PUBLIC_PREFIXES.some((p) => p !== '/' && pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) {
    // If already logged in, redirect away from login/register to dashboard
    if (pathname === '/login' || pathname === '/register') {
      const token = request.cookies.get(SESSION_COOKIE)?.value;
      if (token) {
        try {
          await jwtVerify(token, getSecret());
          return NextResponse.redirect(new URL('/dashboard', request.url));
        } catch {
          // Invalid token — let them through to login/register
        }
      }
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, getSecret());
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL('/login', request.url));
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
