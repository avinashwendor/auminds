import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { submitQuizAttempt } from '@/lib/db/queries';

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { quizId, score, passed } = await request.json();
    if (!quizId || typeof score !== 'number' || score < 0 || score > 100 || typeof passed !== 'boolean') {
      return NextResponse.json({ error: 'Valid quiz ID, score, and result are required' }, { status: 400 });
    }

    await submitQuizAttempt(currentUser.id, quizId, score, passed);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to record quiz attempt' }, { status: 500 });
  }
}
