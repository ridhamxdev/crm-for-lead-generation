import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'crm_session';

function getSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.JWT_SECRET ?? 'vg-crm-super-secret-jwt-key-2025-change-in-prod',
  );
}

export interface SessionPayload {
  userId: number;
  email: string;
  name: string;
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
