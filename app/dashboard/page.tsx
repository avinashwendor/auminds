import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Code2,
  DatabaseZap,
  MessageSquareText,
  Play,
  Trophy,
  Users,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getCurrentUser } from '@/lib/auth';
import { isDatabaseAvailable } from '@/lib/db';
import { getUserCourseTrees, getUserCompletedLessonIds, getUserById } from '@/lib/db/queries';
import styles from './Dashboard.module.css';

interface LessonRecord {
  id: string;
  title: string;
  type: 'video' | 'markdown' | 'code';
  durationMinutes: number;
  points: number;
  moduleTitle: string;
}

interface CourseRecord {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  modules?: Array<{
    id: string;
    title: string;
    lessons?: Omit<LessonRecord, 'moduleTitle'>[];
  }>;
}

interface CourseView extends CourseRecord {
  routeCode: string;
  lessons: LessonRecord[];
  completedCount: number;
  nextLesson?: LessonRecord;
  progress: number;
  href: string;
  remainingMinutes: number;
}

const quickLinks = [
  {
    href: '/dashboard/community',
    label: 'Community',
    description: 'Ask questions and learn with your cohort.',
    icon: MessageSquareText,
  },
  {
    href: '/dashboard/leaderboard',
    label: 'Leaderboard',
    description: 'See current academy standings.',
    icon: Trophy,
  },
  {
    href: '/dashboard/jobs',
    label: 'Job board',
    description: 'Explore curated engineering opportunities.',
    icon: BriefcaseBusiness,
  },
];

function formatLessonType(type: LessonRecord['type']) {
  if (type === 'code') return 'Code lab';
  if (type === 'markdown') return 'Reading';
  return 'Video lesson';
}

export default async function StudentDashboardPage() {
  const session = await getCurrentUser();
  if (!session) redirect('/login');

  const databaseAvailable = await isDatabaseAvailable();
  const [dbUser, rawCourses, completedLessonIds] = databaseAvailable
    ? await Promise.all([
        getUserById(session.id),
        getUserCourseTrees(session.id),
        getUserCompletedLessonIds(session.id),
      ])
    : [null, [], []];

  const completedIds = new Set(completedLessonIds);
  const courseViews: CourseView[] = (rawCourses as CourseRecord[]).map((course, index) => {
    const lessons = (course.modules || []).flatMap((module) =>
      (module.lessons || []).map((lesson) => ({ ...lesson, moduleTitle: module.title })),
    );
    const completedCount = lessons.filter((lesson) => completedIds.has(lesson.id)).length;
    const nextLesson = lessons.find((lesson) => !completedIds.has(lesson.id));
    const progress = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;
    const href = nextLesson
      ? `/dashboard/course/${course.slug}?lessonId=${encodeURIComponent(nextLesson.id)}`
      : `/dashboard/course/${course.slug}`;
    const remainingMinutes = lessons
      .filter((lesson) => !completedIds.has(lesson.id))
      .reduce((sum, lesson) => sum + (lesson.durationMinutes || 0), 0);

    return {
      ...course,
      routeCode: `AUM-${String(index + 1).padStart(2, '0')}`,
      lessons,
      completedCount,
      nextLesson,
      progress,
      href,
      remainingMinutes,
    };
  });

  const currentCourse = courseViews.find((course) => course.nextLesson) || courseViews[0];
  const totalLessons = courseViews.reduce((sum, course) => sum + course.lessons.length, 0);
  const completedLessons = courseViews.reduce((sum, course) => sum + course.completedCount, 0);
  const overallProgress = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const points = dbUser?.points || 0;
  const level = Math.floor(points / 100) + 1;
  const levelProgress = points % 100;
  const certificates = courseViews.filter((course) => course.progress === 100).length;
  const firstName = session.name.trim().split(/\s+/)[0] || session.username;
  const today = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date());

  const metricValue = (value: number | string) => databaseAvailable ? value : '—';

  return (
    <div className={styles.shell}>
      <Navbar user={session} />

      <main className={styles.main}>
        <header className={styles.pageHeader}>
          <div>
            <p className={styles.systemLabel}>Student concourse <span>/</span> {today}</p>
            <h1>Welcome back, {firstName}.</h1>
            <p>Your learning route is ready. Pick up exactly where you left off.</p>
          </div>
          <div className={styles.headerIdentity}>
            <span>{session.username}</span>
            <strong>Level {databaseAvailable ? level : '—'}</strong>
          </div>
        </header>

        {!databaseAvailable && (
          <section className={styles.degradedBanner} role="status">
            <span className={styles.degradedIcon}><DatabaseZap aria-hidden="true" /></span>
            <div>
              <strong>Learning data is temporarily unavailable</strong>
              <p>Your session is safe. Courses, progress, points, and discussion will return automatically when PostgreSQL reconnects.</p>
            </div>
            <span className={styles.degradedState}><i /> Reconnecting</span>
          </section>
        )}

        <section className={styles.departureBoard} aria-labelledby="next-action-title">
          <div className={styles.boardHeader}>
            <span>Next action</span>
            <span>{currentCourse ? currentCourse.routeCode : 'NO ROUTE'}</span>
            <span className={databaseAvailable ? styles.readyState : styles.pausedState}>
              <i /> {databaseAvailable ? 'Ready' : 'Paused'}
            </span>
          </div>

          {databaseAvailable && currentCourse?.nextLesson ? (
            <div className={styles.nextAction}>
              <div className={styles.playMark}><Play aria-hidden="true" /></div>
              <div className={styles.nextLessonCopy}>
                <p>{currentCourse.title} <span>/</span> {currentCourse.nextLesson.moduleTitle}</p>
                <h2 id="next-action-title">{currentCourse.nextLesson.title}</h2>
                <div className={styles.lessonMeta}>
                  <span><Code2 aria-hidden="true" /> {formatLessonType(currentCourse.nextLesson.type)}</span>
                  <span><Clock3 aria-hidden="true" /> {currentCourse.nextLesson.durationMinutes} min</span>
                  <span>+{currentCourse.nextLesson.points} pts</span>
                </div>
              </div>
              <Link className={styles.resumeButton} href={currentCourse.href}>
                Resume lesson <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          ) : databaseAvailable && currentCourse ? (
            <div className={styles.nextAction}>
              <div className={styles.playMark}><Check aria-hidden="true" /></div>
              <div className={styles.nextLessonCopy}>
                <p>{currentCourse.routeCode} <span>/</span> Route complete</p>
                <h2 id="next-action-title">Review {currentCourse.title}</h2>
                <div className={styles.lessonMeta}><span>All assigned lessons completed</span></div>
              </div>
              <Link className={styles.resumeButton} href={currentCourse.href}>Review course <ArrowRight aria-hidden="true" /></Link>
            </div>
          ) : (
            <div className={styles.boardUnavailable}>
              <CircleAlert aria-hidden="true" />
              <div>
                <h2 id="next-action-title">{databaseAvailable ? 'No course assigned yet' : 'Next action is waiting for data'}</h2>
                <p>{databaseAvailable ? 'Your instructor will publish your first learning route here.' : 'This board will restore itself after the database connection returns.'}</p>
              </div>
            </div>
          )}
        </section>

        <section className={styles.metrics} aria-label="Learning progress summary">
          <div><span>Overall progress</span><strong>{metricValue(`${overallProgress}%`)}</strong><small>{metricValue(`${completedLessons} of ${totalLessons} lessons`)}</small></div>
          <div><span>Assigned routes</span><strong>{metricValue(courseViews.length)}</strong><small>Active curriculum</small></div>
          <div><span>Academy points</span><strong>{metricValue(points)}</strong><small>{databaseAvailable ? `${100 - levelProgress} to level ${level + 1}` : 'Awaiting data'}</small></div>
          <div><span>Certificates</span><strong>{metricValue(certificates)}</strong><small>Verified completions</small></div>
        </section>

        <div className={styles.contentGrid}>
          <section className={styles.curriculum} aria-labelledby="curriculum-title">
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.systemLabel}>Assigned curriculum</p>
                <h2 id="curriculum-title">Your learning routes</h2>
              </div>
              <span>{databaseAvailable ? `${courseViews.length} total` : 'Data paused'}</span>
            </div>

            {databaseAvailable && courseViews.length > 0 ? (
              <div className={styles.courseBoard}>
                <div className={styles.courseBoardHeader} aria-hidden="true">
                  <span>Route</span><span>Course</span><span>Next stop</span><span>Progress</span><span>Action</span>
                </div>
                {courseViews.map((course) => (
                  <article className={styles.courseRow} key={course.id}>
                    <span className={styles.routeCode}>{course.routeCode}</span>
                    <div className={styles.courseTitle}>
                      <strong>{course.title}</strong>
                      <span>{course.level} · {course.lessons.length} lessons</span>
                    </div>
                    <div className={styles.nextStop}>
                      <strong>{course.nextLesson?.title || 'Course review'}</strong>
                      <span>{course.nextLesson?.moduleTitle || 'All modules complete'}</span>
                    </div>
                    <div className={styles.courseProgress}>
                      <div><strong>{course.progress}%</strong><span>{course.completedCount}/{course.lessons.length}</span></div>
                      <span className={styles.progressTrack}><i style={{ width: `${course.progress}%` }} /></span>
                    </div>
                    <Link className={styles.courseAction} href={course.href} aria-label={`${course.nextLesson ? 'Continue' : 'Review'} ${course.title}`}>
                      {course.nextLesson ? 'Continue' : 'Review'} <ChevronRight aria-hidden="true" />
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.emptyCurriculum}>
                <BookOpen aria-hidden="true" />
                <h3>{databaseAvailable ? 'Your curriculum is being prepared' : 'Curriculum data is paused'}</h3>
                <p>{databaseAvailable ? 'Assigned courses will appear here with a clear next lesson and completion status.' : 'No progress has been reset. Reconnect PostgreSQL to restore your assigned routes.'}</p>
              </div>
            )}
          </section>

          <aside className={styles.sideColumn}>
            <section className={styles.levelPanel} aria-labelledby="level-title">
              <div className={styles.sectionHeader}>
                <div><p className={styles.systemLabel}>Current standing</p><h2 id="level-title">Level progress</h2></div>
                <Award aria-hidden="true" />
              </div>
              <div className={styles.levelValue}><strong>{metricValue(level)}</strong><span>Engineer level</span></div>
              <div className={styles.levelTrack}><i style={{ width: databaseAvailable ? `${levelProgress}%` : '0%' }} /></div>
              <div className={styles.levelMeta}><span>{databaseAvailable ? `${levelProgress}/100 points` : 'Awaiting data'}</span><span>{databaseAvailable ? `${100 - levelProgress} remaining` : '—'}</span></div>
              {currentCourse && databaseAvailable && (
                <div className={styles.routeSummary}>
                  <span>Current route remaining</span>
                  <strong>{currentCourse.remainingMinutes} min</strong>
                </div>
              )}
            </section>

            <section className={styles.quickLinks} aria-labelledby="support-title">
              <div className={styles.sectionHeader}><div><p className={styles.systemLabel}>Academy network</p><h2 id="support-title">Keep moving</h2></div></div>
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link href={item.href} className={styles.quickLink} key={item.href}>
                    <Icon aria-hidden="true" />
                    <span><strong>{item.label}</strong><small>{item.description}</small></span>
                    <ArrowRight aria-hidden="true" />
                  </Link>
                );
              })}
            </section>

            <section className={styles.helpPanel}>
              <Users aria-hidden="true" />
              <div><strong>Need direction?</strong><p>Use the community to ask a focused question or contact your instructor from the course workspace.</p></div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
