import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  getAllCourses,
  createCourse,
  createModule,
  createLesson,
  deleteCourse,
} from '@/lib/db/queries';
import {
  getCourseSlugForModule,
  persistLessonContentToBlob,
  type LessonContentUrls,
} from '@/lib/db/persist-content';

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
      const createdModule = await createModule(body);
      return NextResponse.json({ module: createdModule });
    }

    if (action === 'createLesson') {
      const { moduleId, markdownContent, initialCode, solutionCode, ...rest } = body;
      const lessonId = rest.id || `lesson-${Date.now()}`;
      const courseSlug = await getCourseSlugForModule(moduleId);

      let contentFields: LessonContentUrls = {
        markdownContent: markdownContent || null,
        initialCode: initialCode || null,
        solutionCode: solutionCode || null,
        markdownUrl: null,
        initialCodeUrl: null,
        solutionCodeUrl: null,
      };

      if (courseSlug) {
        const blobFields = await persistLessonContentToBlob(courseSlug, lessonId, {
          markdownContent,
          initialCode,
          solutionCode,
        });
        contentFields = blobFields;
      }

      const lesson = await createLesson({
        id: lessonId,
        moduleId,
        ...rest,
        ...contentFields,
      });

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
