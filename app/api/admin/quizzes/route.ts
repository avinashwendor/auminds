import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createQuiz, createQuizQuestion } from '@/lib/db/queries';

export async function POST(req: Request) {
  const session = await getCurrentUser();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'createQuiz') {
      const quiz = await createQuiz(body);
      return NextResponse.json({ quiz });
    }

    if (action === 'addQuestion') {
      const question = await createQuizQuestion(body);
      return NextResponse.json({ question });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
