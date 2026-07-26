import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { createSessionToken, verifySessionToken, SESSION_COOKIE_NAME, SessionUser } from './jwt';

export type { SessionUser };
export { createSessionToken, verifySessionToken };

export async function setSessionCookie(user: SessionUser) {
  try {
    const token = await createSessionToken(user);
    const cookieStore = cookies() as any;
    const store = typeof cookieStore?.then === 'function' ? await cookieStore : cookieStore;
    store.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (err) {
    console.error('Error setting session cookie:', err);
  }
}

export async function clearSessionCookie() {
  try {
    const cookieStore = cookies() as any;
    const store = typeof cookieStore?.then === 'function' ? await cookieStore : cookieStore;
    store.delete(SESSION_COOKIE_NAME);
  } catch (err) {
    console.error('Error clearing session cookie:', err);
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies() as any;
    const store = typeof cookieStore?.then === 'function' ? await cookieStore : cookieStore;
    const token = store.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch (err) {
    if (
      err &&
      typeof err === 'object' &&
      'digest' in err &&
      err.digest === 'DYNAMIC_SERVER_USAGE'
    ) {
      throw err;
    }
    console.error('Error getting current user session:', err);
    return null;
  }
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
