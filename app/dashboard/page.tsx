import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, BookOpen, CheckCircle2, Clock3, Flame, Play } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import { getUserCourseTrees, getUserCompletedLessonIds, getUserById } from '@/lib/db/queries';

export default async function StudentDashboardPage() {
  const session = await getCurrentUser();
  if (!session) redirect('/login');

  const [dbUser, courses, completed] = await Promise.all([
    getUserById(session.id),
    getUserCourseTrees(session.id),
    getUserCompletedLessonIds(session.id),
  ]);
  const completedIds = new Set(completed);
  const courseViews = courses.map((course: any, index: number) => {
    const lessons = (course.modules || []).flatMap((module: any) =>
      (module.lessons || []).map((lesson: any) => ({ ...lesson, moduleTitle: module.title })),
    );
    const completedCount = lessons.filter((lesson: any) => completedIds.has(lesson.id)).length;
    const nextLesson = lessons.find((lesson: any) => !completedIds.has(lesson.id));
    const progress = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;
    const href = nextLesson
      ? `/dashboard/course/${course.slug}?lessonId=${encodeURIComponent(nextLesson.id)}`
      : `/dashboard/course/${course.slug}`;

    return { ...course, routeCode: `AUM-${String(index + 1).padStart(2, '0')}`, lessons, completedCount, nextLesson, progress, href };
  });
  const currentCourse = courseViews.find((course: any) => course.nextLesson) || courseViews[0];
  const totalLessons = courseViews.reduce((sum: number, course: any) => sum + course.lessons.length, 0);
  const overallProgress = totalLessons ? Math.round((completed.length / totalLessons) * 100) : 0;
  const user = dbUser || session;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar user={session} />
      <main className="mx-auto w-full max-w-[88rem] p-4 sm:p-6 md:px-8 md:py-8 lg:px-10">
        <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3"><span className="signal-dot" /><span className="board-label">Learning network / Online</span></div>
            <h1 className="board-value text-4xl leading-none sm:text-5xl">MY LEARNING</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Welcome back, {user.name}. Pick up the next lesson or review every assigned route.</p>
          </div>
          <div className="grid grid-cols-3 border border-border bg-card">
            <div className="min-w-24 px-4 py-3"><span className="board-label">Routes</span><strong className="board-value mt-1 block text-2xl">{courseViews.length}</strong></div>
            <div className="min-w-24 border-l border-border px-4 py-3"><span className="board-label">Lessons</span><strong className="board-value mt-1 block text-2xl">{completed.length}</strong></div>
            <div className="min-w-24 border-l border-border px-4 py-3"><span className="board-label">Points</span><strong className="board-value mt-1 block text-2xl">{(user as any).points || 0}</strong></div>
          </div>
        </header>

        {currentCourse ? (
          <section className="mt-8 border border-border bg-card" aria-labelledby="continue-title">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
              <span className="board-label text-primary">Continue learning</span>
              <span className="board-label">{currentCourse.routeCode}</span>
            </div>
            <div className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,.6fr)]">
              <div className="p-5 sm:p-7 lg:p-8">
                <p className="board-label">{currentCourse.title}</p>
                <h2 id="continue-title" className="board-value mt-3 max-w-3xl text-3xl leading-tight sm:text-4xl">
                  {currentCourse.nextLesson?.title || 'Course complete'}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {currentCourse.nextLesson
                    ? `${currentCourse.nextLesson.moduleTitle} · Your next incomplete lesson is ready.`
                    : 'Every lesson in this route is complete. Revisit the workspace whenever you need a refresher.'}
                </p>
                <Button asChild size="lg" className="mt-7 min-w-44">
                  <Link href={currentCourse.href}>{currentCourse.nextLesson ? 'Continue lesson' : 'Review course'}<ArrowRight className="size-4" /></Link>
                </Button>
              </div>
              <div className="border-t border-border bg-background p-5 lg:border-l lg:border-t-0 lg:p-7">
                <div className="flex items-end justify-between gap-4">
                  <div><span className="board-label">Route progress</span><strong className="board-value mt-2 block text-4xl">{currentCourse.progress}%</strong></div>
                  <span className="font-mono text-xs text-muted-foreground">{currentCourse.completedCount}/{currentCourse.lessons.length} lessons</span>
                </div>
                <div className="mt-5 h-2 overflow-hidden bg-muted" role="progressbar" aria-label={`${currentCourse.title} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={currentCourse.progress}>
                  <div className="h-full bg-primary" style={{ width: `${currentCourse.progress}%` }} />
                </div>
                <dl className="mt-6 grid gap-4 border-t border-border pt-5 text-sm">
                  <div className="flex items-center justify-between gap-4"><dt className="flex items-center gap-2 text-muted-foreground"><BookOpen className="size-4" /> Level</dt><dd className="font-bold">{currentCourse.level || 'All levels'}</dd></div>
                  <div className="flex items-center justify-between gap-4"><dt className="flex items-center gap-2 text-muted-foreground"><Clock3 className="size-4" /> Status</dt><dd className="font-bold">{currentCourse.nextLesson ? 'In progress' : 'Complete'}</dd></div>
                </dl>
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-8 border-y border-border py-16 text-center" aria-labelledby="empty-learning-title">
            <BookOpen className="mx-auto mb-4 size-7 text-muted-foreground" />
            <h2 id="empty-learning-title" className="board-value text-2xl">NO LEARNING ROUTES YET</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Your assigned courses will appear here. Ask an administrator to add your first route.</p>
          </section>
        )}

        {courseViews.length > 0 && (
          <section className="mt-10" aria-labelledby="routes-title">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div><p className="board-label">Assigned curriculum</p><h2 id="routes-title" className="board-value mt-2 text-3xl">ALL ROUTES</h2></div>
              <span className="hidden board-label sm:block">{overallProgress}% overall complete</span>
            </div>
            <div className="border-t border-border">
              <div className="hidden grid-cols-[5rem_minmax(0,1fr)_9rem_9rem_8rem] gap-5 border-b border-border px-3 py-3 board-label lg:grid">
                <span>Route</span><span>Course / Next lesson</span><span>Progress</span><span>Status</span><span>Action</span>
              </div>
              {courseViews.map((course: any) => (
                <article key={course.id} className="group grid gap-5 border-b border-border px-3 py-6 transition-colors hover:bg-card lg:grid-cols-[5rem_minmax(0,1fr)_9rem_9rem_8rem] lg:items-center">
                  <span className="font-mono text-xs font-bold text-primary">{course.routeCode}</span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-foreground">{course.title}</h3>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{course.nextLesson ? `Next: ${course.nextLesson.title}` : course.lessons.length ? 'All lessons complete' : 'Curriculum is being prepared'}</p>
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between font-mono text-[10px] text-muted-foreground"><span>{course.progress}%</span><span>{course.completedCount}/{course.lessons.length}</span></div>
                    <div className="h-1.5 bg-muted" role="progressbar" aria-label={`${course.title} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={course.progress}><div className="h-full bg-primary" style={{ width: `${course.progress}%` }} /></div>
                  </div>
                  <span className="flex items-center gap-2 text-sm font-bold"><span className={course.progress === 100 ? 'size-2 bg-emerald-400' : 'size-2 bg-primary'} />{course.progress === 100 ? 'Complete' : course.lessons.length ? 'In progress' : 'Pending'}</span>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={course.href}>{course.nextLesson ? <Play className="size-4" /> : <CheckCircle2 className="size-4" />}{course.nextLesson ? 'Resume' : 'Open'}</Link>
                  </Button>
                </article>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border py-5">
          <span className="board-label">Learning record / {completed.length} lessons complete</span>
          <span className="flex items-center gap-2 board-label text-primary"><Flame className="size-4" />{(user as any).points || 0} points earned</span>
        </footer>
      </main>
    </div>
  );
}
