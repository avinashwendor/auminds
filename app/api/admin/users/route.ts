import { NextResponse } from 'next/server';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { createUser, getAllUsers } from '@/lib/db/queries';

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const usersList = await getAllUsers();
  return NextResponse.json({ users: usersList });
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { username, password, name, role, assignedCourseIds } = await request.json();

    if (!username || !password || !name) {
      return NextResponse.json({ error: 'Username, password, and name are required' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const newUser = await createUser({
      username,
      passwordHash,
      name,
      role: role || 'student',
      assignedCourseIds: assignedCourseIds || [],
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (err: any) {
    console.error('Create user error:', err);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
