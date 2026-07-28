import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { setUsersStatus, setUserEnrollments } from '@/lib/db/queries';
import type { AccountStatus } from '@/lib/db/schema';

export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { userIds, status, note, assignedCourseIds } = await request.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'userIds array is required' }, { status: 400 });
    }

    const validStatuses: AccountStatus[] = ['pending', 'approved', 'rejected', 'suspended'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await setUsersStatus(userIds, status, currentUser.id, note || null);

    // If courses were passed for single or batch approval, update enrollments
    if (Array.isArray(assignedCourseIds) && assignedCourseIds.length > 0) {
      for (const uid of userIds) {
        await setUserEnrollments(uid, assignedCourseIds, currentUser.id);
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount: updated.length,
      status,
    });
  } catch (err: any) {
    console.error('Update user status error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update user status' }, { status: 500 });
  }
}
