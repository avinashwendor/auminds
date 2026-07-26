import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAllCourses, createCourse, createModule, createLesson, deleteCourse } from '@/lib/db/queries';

export async function GET() {
  const session = await getCurrentUser();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const courses = await getAllCourses();
  return NextResponse.json({ courses });
}

export async function POST(req: Request) {
  const session = await getCurrentUser();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'createCourse') {
      const course = await createCourse(body);
      return NextResponse.json({ course });
    }

    if (action === 'createModule') {
      const module = await createModule(body);
      return NextResponse.json({ module });
    }

    if (action === 'createLesson') {
      const lesson = await createLesson(body);
      return NextResponse.json({ lesson });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getCurrentUser();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    if (!courseId) return NextResponse.json({ error: 'Course ID required' }, { status: 400 });

    await deleteCourse(courseId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
