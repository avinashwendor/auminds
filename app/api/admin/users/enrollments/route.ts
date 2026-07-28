import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { setUserEnrollments, assignCourseToUsers, unassignCourseFromUsers } from '@/lib/db/queries';

export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();

    // Mode 1: Update single user's complete list of assigned courses
    if (body.userId && Array.isArray(body.courseIds)) {
      const updated = await setUserEnrollments(body.userId, body.courseIds, currentUser.id);
      return NextResponse.json({ success: true, userId: body.userId, courseIds: updated });
    }

    // Mode 2: Bulk assign or unassign a specific course across multiple users
    if (body.courseId && Array.isArray(body.userIds) && body.action) {
      if (body.action === 'assign') {
        await assignCourseToUsers(body.userIds, body.courseId, currentUser.id);
      } else if (body.action === 'unassign') {
        await unassignCourseFromUsers(body.userIds, body.courseId);
      } else {
        return NextResponse.json({ error: 'Invalid action for bulk course assignment' }, { status: 400 });
      }
      return NextResponse.json({ success: true, courseId: body.courseId, userCount: body.userIds.length, action: body.action });
    }

    return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
  } catch (err: any) {
    console.error('Update course enrollments error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update course access' }, { status: 500 });
  }
}
