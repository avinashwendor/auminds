import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { submitAssignment, updateAssignmentSubmission } from '@/lib/db/queries';

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { assignmentId, submissionId, repoUrl, demoUrl, notes } = await request.json();
    if (!assignmentId || !repoUrl) {
      return NextResponse.json({ error: 'Assignment ID and repository URL are required' }, { status: 400 });
    }
    try {
      const repository = new URL(repoUrl);
      if (!['http:', 'https:'].includes(repository.protocol)) throw new Error('protocol');
      if (demoUrl) {
        const demo = new URL(demoUrl);
        if (!['http:', 'https:'].includes(demo.protocol)) throw new Error('protocol');
      }
    } catch {
      return NextResponse.json({ error: 'Enter valid HTTP or HTTPS project URLs' }, { status: 400 });
    }

    const submission = submissionId
      ? await updateAssignmentSubmission(submissionId, currentUser.id, repoUrl, demoUrl, notes)
      : await submitAssignment(currentUser.id, assignmentId, repoUrl, demoUrl, notes);
    return NextResponse.json({ success: true, submission });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to submit assignment' }, { status: 500 });
  }
}
