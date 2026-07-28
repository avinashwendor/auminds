import { NextResponse } from 'next/server';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { updateUserProfile, deleteUser, getUserById, countAdmins } from '@/lib/db/queries';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const { name, email, role, password } = await request.json();

    const existing = await getUserById(id);
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Safety check: Prevent revoking admin status of the last admin account
    if (existing.role === 'admin' && role === 'student') {
      const adminCount = await countAdmins();
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot change role. At least one administrator account must exist.' }, { status: 400 });
      }
    }

    const patch: { name?: string; email?: string | null; role?: 'admin' | 'student'; passwordHash?: string } = {};
    if (name) patch.name = String(name).trim();
    if (email !== undefined) patch.email = email ? String(email).trim().toLowerCase() : null;
    if (role === 'admin' || role === 'student') patch.role = role;
    if (password) patch.passwordHash = await hashPassword(password);

    const updated = await updateUserProfile(id, patch);
    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    console.error('Update user profile error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update user profile' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;

  try {
    if (id === currentUser.id) {
      return NextResponse.json({ error: 'You cannot delete your own logged-in admin account' }, { status: 400 });
    }

    const target = await getUserById(id);
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (target.role === 'admin') {
      const adminCount = await countAdmins();
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot delete the last administrator account' }, { status: 400 });
      }
    }

    await deleteUser(id);
    return NextResponse.json({ success: true, message: `Account @${target.username} has been deleted` });
  } catch (err: any) {
    console.error('Delete user error:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete user' }, { status: 500 });
  }
}
