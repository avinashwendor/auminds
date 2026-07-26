import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getCommunityMessages, sendCommunityMessage } from '@/lib/db/queries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId') || undefined;

  const messages = await getCommunityMessages(courseId);
  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { content, courseId } = await request.json();
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 });
    }
    if (content.trim().length > 1000) {
      return NextResponse.json({ error: 'Message must be 1,000 characters or fewer' }, { status: 400 });
    }

    const message = await sendCommunityMessage(currentUser.id, content.trim(), courseId);
    return NextResponse.json({ success: true, message });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
