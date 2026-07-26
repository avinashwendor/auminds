import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'auminds-secret-key-super-secure-production-2026'
);

export const SESSION_COOKIE_NAME = 'auminds_session';

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'student';
}

export async function createSessionToken(user: SessionUser) {
  return await new SignJWT({ id: user.id, username: user.username, name: user.name, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const verified = await jwtVerify(token, SECRET_KEY);
    return verified.payload as unknown as SessionUser;
  } catch (err) {
    return null;
  }
}
