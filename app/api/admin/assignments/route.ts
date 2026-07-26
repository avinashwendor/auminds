import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAllPendingSubmissions, reviewAssignmentSubmission } from '@/lib/db/queries';

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const submissions = await getAllPendingSubmissions();
  return NextResponse.json({ submissions });
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { submissionId, status, pointsAwarded, feedback } = await request.json();
    if (!submissionId || !status) {
      return NextResponse.json({ error: 'Submission ID and status are required' }, { status: 400 });
    }

    await reviewAssignmentSubmission(submissionId, status, pointsAwarded || 0, feedback || '');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to review assignment' }, { status: 500 });
  }
}
