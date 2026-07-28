import { NextResponse } from 'next/server';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { createUser, getAdminUserDirectory, getAllCourses, getUserByEmail, getUserByUsername } from '@/lib/db/queries';

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const [usersList, coursesList] = await Promise.all([
      getAdminUserDirectory(),
      getAllCourses(),
    ]);
    return NextResponse.json({ users: usersList, courses: coursesList });
  } catch (err: any) {
    console.error('Error fetching admin user directory:', err);
    return NextResponse.json({ error: 'Failed to fetch user directory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { username, password, name, email, role, status, signupGoal, assignedCourseIds } = await request.json();

    if (!username || !password || !name) {
      return NextResponse.json({ error: 'Username, password, and name are required' }, { status: 400 });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanEmail = email ? String(email).trim().toLowerCase() : null;

    const [existingUsername, existingEmail] = await Promise.all([
      getUserByUsername(cleanUsername),
      cleanEmail ? getUserByEmail(cleanEmail) : Promise.resolve(null),
    ]);

    if (existingUsername) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
    }
    if (existingEmail) {
      return NextResponse.json({ error: 'An account with that email already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const newUser = await createUser({
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      name: String(name).trim(),
      role: role === 'admin' ? 'admin' : 'student',
      status: status || 'approved',
      signupGoal: signupGoal || null,
      assignedCourseIds: Array.isArray(assignedCourseIds) ? assignedCourseIds : [],
      reviewedBy: currentUser.id,
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (err: any) {
    console.error('Create user error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create user' }, { status: 500 });
  }
}
