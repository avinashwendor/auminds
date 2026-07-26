import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getCommunityMessages, sendCommunityMessage } from '@/lib/db/queries';
import { isDatabaseAvailable } from '@/lib/db';

const RETRY_AFTER_SECONDS = 30;

function unavailableResponse() {
  return NextResponse.json(
    {
      messages: [],
      degraded: true,
      retryAfterMs: RETRY_AFTER_SECONDS * 1000,
      error: 'Discussion is temporarily unavailable while the data service reconnects.',
    },
    { status: 503, headers: { 'Retry-After': String(RETRY_AFTER_SECONDS) } },
  );
}

export async function GET(request: Request) {
  if (!(await isDatabaseAvailable())) return unavailableResponse();

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId') || undefined;
  const messages = await getCommunityMessages(courseId);
  return NextResponse.json({ messages, degraded: false });
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await isDatabaseAvailable())) return unavailableResponse();

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
  } catch {
    return NextResponse.json(
      { error: 'Message could not be saved. Please try again when the data service is available.' },
      { status: 503, headers: { 'Retry-After': String(RETRY_AFTER_SECONDS) } },
    );
  }
}
