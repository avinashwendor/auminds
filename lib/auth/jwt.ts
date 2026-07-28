import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'auminds-secret-key-super-secure-production-2026'
);

export const SESSION_COOKIE_NAME = 'auminds_session';

export type SessionStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'student';
  status: SessionStatus;
}

export async function createSessionToken(user: SessionUser) {
  return await new SignJWT({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    status: user.status,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const verified = await jwtVerify(token, SECRET_KEY);
    const payload = verified.payload as unknown as SessionUser;
    // Sessions issued before the approval workflow existed have no status claim.
    return { ...payload, status: payload.status || 'approved' };
  } catch {
    return null;
  }
}
