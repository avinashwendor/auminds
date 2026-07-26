import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { markLessonCompleted } from '@/lib/db/queries';

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { lessonId } = await request.json();
    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID required' }, { status: 400 });
    }

    await markLessonCompleted(currentUser.id, lessonId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to record completion' }, { status: 500 });
  }
}
