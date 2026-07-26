import { notFound, redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getCurrentUser } from '@/lib/auth';
import {
  getCourseBySlug,
  getCourseFullTree,
  getUserCompletedLessonIds,
  getQuizForLesson,
  getAssignmentForLesson,
  getUserSubmissionForAssignment,
  isUserEnrolledInCourse,
} from '@/lib/db/queries';
import CourseWorkspaceClient from './CourseWorkspaceClient';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lessonId?: string | string[] }>;
}

export default async function CoursePage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const lessonId = Array.isArray(query.lessonId) ? query.lessonId[0] : query.lessonId;
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const courseBase = await getCourseBySlug(slug);
  if (!courseBase) notFound();

  const [course, completedLessonIds, isEnrolled] = await Promise.all([
    getCourseFullTree(courseBase.id),
    getUserCompletedLessonIds(user.id),
    user.role === 'student' ? isUserEnrolledInCourse(user.id, courseBase.id) : Promise.resolve(true),
  ]);

  if (!isEnrolled) redirect('/dashboard');
  if (!course) notFound();

  const allLessons = course.modules.flatMap((module: any) => module.lessons || []);
  const activeLesson = lessonId
    ? allLessons.find((lesson: any) => lesson.id === lessonId) || allLessons[0] || null
    : allLessons[0] || null;

  let activeQuiz: any = null;
  let activeAssignment: any = null;
  let existingSubmission: any = null;

  if (activeLesson) {
    [activeQuiz, activeAssignment] = await Promise.all([
      getQuizForLesson(activeLesson.id),
      getAssignmentForLesson(activeLesson.id),
    ]);
    if (activeAssignment) {
      existingSubmission = await getUserSubmissionForAssignment(user.id, activeAssignment.id);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={user} />
      <CourseWorkspaceClient
        course={course}
        activeLesson={activeLesson}
        completedLessonIds={completedLessonIds}
        activeQuiz={activeQuiz}
        activeAssignment={activeAssignment}
        existingSubmission={existingSubmission}
        studentName={user.name}
      />
    </div>
  );
}
