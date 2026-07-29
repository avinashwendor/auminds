import { db, withDatabaseFallback } from './index';
import {
  users,
  courses,
  courseEnrollments,
  modules,
  lessons,
  lessonCompletions,
  quizzes,
  quizAttempts,
  assignments,
  assignmentSubmissions,
} from './schema';
import { eq, desc, sql } from 'drizzle-orm';
import type {
  AdminStudentProgressRecord,
  AdminStudentProgressResponse,
  StudentActivityItem,
  StudentCourseProgress,
} from '@/lib/types/admin-progress';

function toIso(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export async function getAdminStudentProgress(
  userId?: string,
): Promise<AdminStudentProgressResponse> {
  return withDatabaseFallback(
    'getAdminStudentProgress',
    async () => {
      const studentFilter = userId
        ? eq(users.id, userId)
        : eq(users.role, 'student');

      const [
        studentRows,
        courseRows,
        enrollmentRows,
        lessonCountRows,
        completionRows,
        quizAttemptRows,
        submissionRows,
      ] = await Promise.all([
        db.select().from(users).where(studentFilter).orderBy(desc(users.createdAt)),
        db.select({ id: courses.id, title: courses.title, slug: courses.slug }).from(courses),
        db
          .select({ userId: courseEnrollments.userId, courseId: courseEnrollments.courseId })
          .from(courseEnrollments),
        db
          .select({
            courseId: courses.id,
            totalLessons: sql<number>`count(${lessons.id})::int`,
          })
          .from(courses)
          .leftJoin(modules, eq(modules.courseId, courses.id))
          .leftJoin(lessons, eq(lessons.moduleId, modules.id))
          .groupBy(courses.id),
        db
          .select({
            userId: lessonCompletions.userId,
            lessonId: lessonCompletions.lessonId,
            completedAt: lessonCompletions.completedAt,
            lessonTitle: lessons.title,
            lessonType: lessons.type,
            courseId: courses.id,
            courseTitle: courses.title,
            courseSlug: courses.slug,
          })
          .from(lessonCompletions)
          .innerJoin(lessons, eq(lessonCompletions.lessonId, lessons.id))
          .innerJoin(modules, eq(lessons.moduleId, modules.id))
          .innerJoin(courses, eq(modules.courseId, courses.id))
          .orderBy(desc(lessonCompletions.completedAt)),
        db
          .select({
            id: quizAttempts.id,
            userId: quizAttempts.userId,
            score: quizAttempts.score,
            passed: quizAttempts.passed,
            createdAt: quizAttempts.createdAt,
            quizTitle: quizzes.title,
            lessonTitle: lessons.title,
            courseTitle: courses.title,
            courseSlug: courses.slug,
          })
          .from(quizAttempts)
          .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
          .leftJoin(lessons, eq(quizzes.lessonId, lessons.id))
          .leftJoin(modules, eq(lessons.moduleId, modules.id))
          .leftJoin(courses, eq(modules.courseId, courses.id))
          .orderBy(desc(quizAttempts.createdAt)),
        db
          .select({
            id: assignmentSubmissions.id,
            userId: assignmentSubmissions.userId,
            status: assignmentSubmissions.status,
            pointsAwarded: assignmentSubmissions.pointsAwarded,
            submittedAt: assignmentSubmissions.submittedAt,
            assignmentTitle: assignments.title,
            courseTitle: courses.title,
            courseSlug: courses.slug,
          })
          .from(assignmentSubmissions)
          .innerJoin(assignments, eq(assignmentSubmissions.assignmentId, assignments.id))
          .leftJoin(lessons, eq(assignments.lessonId, lessons.id))
          .leftJoin(modules, eq(lessons.moduleId, modules.id))
          .leftJoin(courses, eq(modules.courseId, courses.id))
          .orderBy(desc(assignmentSubmissions.submittedAt)),
      ]);

      const lessonCountMap = new Map(
        lessonCountRows.map((row) => [row.courseId, Number(row.totalLessons) || 0]),
      );

      const enrollmentsByUser = new Map<string, string[]>();
      for (const row of enrollmentRows) {
        const list = enrollmentsByUser.get(row.userId) || [];
        list.push(row.courseId);
        enrollmentsByUser.set(row.userId, list);
      }

      const completionsByUser = new Map<string, typeof completionRows>();
      const completedCountByUserCourse = new Map<string, number>();

      for (const row of completionRows) {
        const list = completionsByUser.get(row.userId) || [];
        list.push(row);
        completionsByUser.set(row.userId, list);

        const key = `${row.userId}:${row.courseId}`;
        completedCountByUserCourse.set(key, (completedCountByUserCourse.get(key) || 0) + 1);
      }

      const quizAttemptsByUser = new Map<string, typeof quizAttemptRows>();
      for (const row of quizAttemptRows) {
        const list = quizAttemptsByUser.get(row.userId) || [];
        list.push(row);
        quizAttemptsByUser.set(row.userId, list);
      }

      const submissionsByUser = new Map<string, typeof submissionRows>();
      for (const row of submissionRows) {
        const list = submissionsByUser.get(row.userId) || [];
        list.push(row);
        submissionsByUser.set(row.userId, list);
      }

      const courseMeta = new Map(courseRows.map((c) => [c.id, c]));

      const students: AdminStudentProgressRecord[] = studentRows.map((student) => {
        const userCompletions = completionsByUser.get(student.id) || [];
        const userQuizzes = quizAttemptsByUser.get(student.id) || [];
        const userSubmissions = submissionsByUser.get(student.id) || [];
        const enrolledCourseIds = enrollmentsByUser.get(student.id) || [];

        const courseProgress: StudentCourseProgress[] = enrolledCourseIds
          .map((courseId) => {
            const course = courseMeta.get(courseId);
            if (!course) return null;
            const totalLessons = lessonCountMap.get(courseId) || 0;
            const completedLessons = completedCountByUserCourse.get(`${student.id}:${courseId}`) || 0;
            const progressPercent = totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0;
            return {
              courseId,
              courseTitle: course.title,
              courseSlug: course.slug,
              totalLessons,
              completedLessons,
              progressPercent,
            };
          })
          .filter((item): item is StudentCourseProgress => item !== null);

        const activity: StudentActivityItem[] = [
          ...userCompletions.map((row) => ({
            id: `lesson-${row.lessonId}-${toIso(row.completedAt)}`,
            type: 'lesson' as const,
            title: row.lessonTitle,
            courseTitle: row.courseTitle,
            courseSlug: row.courseSlug,
            timestamp: toIso(row.completedAt)!,
            meta: { lessonType: row.lessonType },
          })),
          ...userQuizzes.map((row) => ({
            id: row.id,
            type: 'quiz' as const,
            title: row.quizTitle,
            courseTitle: row.courseTitle || 'Course',
            courseSlug: row.courseSlug || '',
            timestamp: toIso(row.createdAt)!,
            meta: { score: row.score, passed: row.passed },
          })),
          ...userSubmissions.map((row) => ({
            id: row.id,
            type: 'assignment' as const,
            title: row.assignmentTitle,
            courseTitle: row.courseTitle || 'Course',
            courseSlug: row.courseSlug || '',
            timestamp: toIso(row.submittedAt)!,
            meta: {
              status: row.status,
              pointsAwarded: row.pointsAwarded,
            },
          })),
        ]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 25);

        const lastActiveAt = activity[0]?.timestamp ?? null;

        return {
          userId: student.id,
          name: student.name,
          username: student.username,
          email: student.email,
          points: student.points,
          status: student.status,
          avatarUrl: student.avatarUrl,
          courses: courseProgress,
          recentActivity: activity,
          stats: {
            lessonsCompleted: userCompletions.length,
            quizzesAttempted: userQuizzes.length,
            quizzesPassed: userQuizzes.filter((q) => q.passed).length,
            assignmentsSubmitted: userSubmissions.length,
            assignmentsAccepted: userSubmissions.filter((s) => s.status === 'accepted').length,
          },
          lastActiveAt,
        };
      });

      return { students, courses: courseRows };
    },
    { students: [], courses: [] },
  );
}
