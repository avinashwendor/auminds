import { NextResponse } from 'next/server';
import { getUserByUsername } from '@/lib/db/queries';
import { verifyPassword, setSessionCookie } from '@/lib/auth';

const STATUS_MESSAGES: Record<string, string> = {
  pending: 'Your account is still awaiting administrator approval. You will be able to sign in once it is approved.',
  rejected: 'Your account request was declined. Contact the academy team if you believe this is a mistake.',
  suspended: 'Your account has been suspended. Contact the academy team to restore access.',
};

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const user = await getUserByUsername(String(username).trim());
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Credentials are correct, but access is gated on the approval workflow.
    const status = (user.status || 'approved') as 'pending' | 'approved' | 'rejected' | 'suspended';
    if (status !== 'approved') {
      return NextResponse.json(
        {
          error: STATUS_MESSAGES[status] || 'This account cannot sign in right now.',
          status,
          statusNote: user.statusNote || null,
        },
        { status: 403 },
      );
    }

    await setSessionCookie({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role as 'admin' | 'student',
      status,
    });

    return NextResponse.json({ 
      success: true, 
      role: user.role,
      user: { id: user.id, username: user.username, name: user.name, role: user.role } 
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
