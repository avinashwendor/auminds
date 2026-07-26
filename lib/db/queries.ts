import { db, withDatabaseFallback } from './index';
import { 
  users, courses, courseEnrollments, modules, lessons, 
  lessonCompletions, quizzes, quizQuestions, quizAttempts, 
  assignments, assignmentSubmissions, jobPostings, communityMessages 
} from './schema';
import { eq, and, desc, sql } from 'drizzle-orm';

const allowMockUsers = process.env.NODE_ENV !== 'production' && process.env.ENABLE_MOCK_USERS !== 'false';

const MOCK_USERS: Record<string, any> = {
  admin: {
    id: 'user-admin-1',
    username: 'admin',
    passwordHash: '$2a$10$3x28NbGYPqhapSZnMehDg.sea8nwjwxGdbVEEWXF2OME3JVfC09yO', // admin123
    name: 'Admin Director',
    role: 'admin',
    points: 500,
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
    createdAt: new Date(),
  },
  alex_coder: {
    id: 'user-student-1',
    username: 'alex_coder',
    passwordHash: '$2a$10$6Mgh3ZBTusuzYjpb06LCk.nb6PSzviWkd3.yDIL9noWeTKUKpYFn6', // student123
    name: 'Alex Rivera',
    role: 'student',
    points: 380,
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=alex',
    createdAt: new Date(),
  },
};

// User Queries using Drizzle QueryBuilder
export async function getUserByUsername(username: string) {
  const normalizedUsername = username.toLowerCase();
  const fallbackUser = allowMockUsers ? MOCK_USERS[normalizedUsername] || null : null;

  return withDatabaseFallback(
    'getUserByUsername',
    async () => {
      const result = await db.select().from(users).where(eq(users.username, normalizedUsername)).limit(1);
      return result[0] || fallbackUser;
    },
    fallbackUser,
  );
}

export async function getUserById(id: string) {
  const fallbackUser = allowMockUsers
    ? Object.values(MOCK_USERS).find((user) => user.id === id) || null
    : null;

  return withDatabaseFallback(
    'getUserById',
    async () => {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0] || fallbackUser;
    },
    fallbackUser,
  );
}

export async function getAllUsers() {
  try {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  } catch (err) {
    console.error('[Queries] Error in getAllUsers:', err);
    return [];
  }
}

export async function createUser(userData: { username: string; passwordHash: string; name: string; role: 'admin' | 'student'; assignedCourseIds?: string[] }) {
  const newUser = {
    id: `user-${Date.now()}`,
    username: userData.username.toLowerCase(),
    passwordHash: userData.passwordHash,
    name: userData.name,
    role: userData.role,
    points: 0,
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${userData.username}`,
    createdAt: new Date(),
  };

  const inserted = await db.insert(users).values(newUser).returning();
  const userObj = inserted[0] || newUser;

  if (userData.assignedCourseIds && userData.assignedCourseIds.length > 0) {
    for (const courseId of userData.assignedCourseIds) {
      await assignCourseToUser(userObj.id, courseId);
    }
  }
  return userObj;
}

export async function assignCourseToUser(userId: string, courseId: string) {
  await db.insert(courseEnrollments).values({
    id: `enroll-${Date.now()}-${Math.random()}`,
    userId,
    courseId,
  });
}

export async function getUserAssignedCourses(userId: string) {
  try {
    const rows = await db
      .select({ course: courses })
      .from(courseEnrollments)
      .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
      .where(eq(courseEnrollments.userId, userId));
    return rows.map(({ course }) => course);
  } catch (err) {
    console.error('[Queries] Error in getUserAssignedCourses:', err);
    return [];
  }
}

export async function isUserEnrolledInCourse(userId: string, courseId: string) {
  try {
    const enrollment = await db
      .select({ id: courseEnrollments.id })
      .from(courseEnrollments)
      .where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, courseId)))
      .limit(1);
    return enrollment.length > 0;
  } catch (err) {
    console.error('[Queries] Error in isUserEnrolledInCourse:', err);
    return false;
  }
}

export async function getUserCourseTrees(userId: string) {
  return withDatabaseFallback(
    'getUserCourseTrees',
    async () => {
      const rows = await db
        .select({ course: courses, module: modules, lesson: lessons })
        .from(courseEnrollments)
        .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
        .leftJoin(modules, eq(modules.courseId, courses.id))
        .leftJoin(lessons, eq(lessons.moduleId, modules.id))
        .where(eq(courseEnrollments.userId, userId))
        .orderBy(modules.orderIndex, lessons.orderIndex);

      const courseMap = new Map<string, any>();
      const moduleMaps = new Map<string, Map<string, any>>();
      for (const row of rows) {
        if (!courseMap.has(row.course.id)) {
          courseMap.set(row.course.id, { ...row.course, modules: [] });
          moduleMaps.set(row.course.id, new Map());
        }
        if (!row.module) continue;
        const modulesForCourse = moduleMaps.get(row.course.id)!;
        if (!modulesForCourse.has(row.module.id)) {
          const moduleWithLessons = { ...row.module, lessons: [] as any[] };
          modulesForCourse.set(row.module.id, moduleWithLessons);
          courseMap.get(row.course.id).modules.push(moduleWithLessons);
        }
        if (row.lesson) modulesForCourse.get(row.module.id).lessons.push(row.lesson);
      }
      return Array.from(courseMap.values());
    },
    [],
  );
}

// Course Queries
export async function getAllCourses() {
  try {
    return await db.select().from(courses).orderBy(desc(courses.createdAt));
  } catch (err) {
    console.error('[Queries] Error in getAllCourses:', err);
    return [];
  }
}

export async function getCourseBySlug(slug: string) {
  try {
    const result = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
    if (result.length > 0) return result[0];
  } catch (err) {
    console.error('[Queries] Error in getCourseBySlug:', err);
  }
  return null;
}

export async function getCourseFullTree(courseId: string) {
  try {
    const rows = await db
      .select({ course: courses, module: modules, lesson: lessons })
      .from(courses)
      .leftJoin(modules, eq(modules.courseId, courses.id))
      .leftJoin(lessons, eq(lessons.moduleId, modules.id))
      .where(eq(courses.id, courseId))
      .orderBy(modules.orderIndex, lessons.orderIndex);
    if (!rows.length) return null;

    const courseModules: any[] = [];
    const moduleMap = new Map<string, any>();
    for (const row of rows) {
      if (!row.module) continue;
      if (!moduleMap.has(row.module.id)) {
        const moduleWithLessons = { ...row.module, lessons: [] as any[] };
        moduleMap.set(row.module.id, moduleWithLessons);
        courseModules.push(moduleWithLessons);
      }
      if (row.lesson) moduleMap.get(row.module.id).lessons.push(row.lesson);
    }
    return { ...rows[0].course, modules: courseModules };
  } catch (err) {
    console.error('[Queries] Error in getCourseFullTree:', err);
    return null;
  }
}

// Lesson & Completion Queries
export async function getLessonById(lessonId: string) {
  try {
    const result = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
    if (result.length > 0) return result[0];
  } catch (err) {
    console.error('[Queries] Error in getLessonById:', err);
  }
  return null;
}

export async function markLessonCompleted(userId: string, lessonId: string) {
  try {
    const existing = await db.select().from(lessonCompletions).where(and(eq(lessonCompletions.userId, userId), eq(lessonCompletions.lessonId, lessonId))).limit(1);
    if (existing.length === 0) {
      await db.insert(lessonCompletions).values({
        id: `comp-${Date.now()}`,
        userId,
        lessonId
      });
      const lesson = await getLessonById(lessonId);
      if (lesson) {
        await db.update(users).set({ points: sql`${users.points} + ${lesson.points}` }).where(eq(users.id, userId));
      }
    }
  } catch (err) {
    console.error('[Queries] Error in markLessonCompleted:', err);
  }
}

export async function getUserCompletedLessonIds(userId: string) {
  return withDatabaseFallback(
    'getUserCompletedLessonIds',
    async () => {
      const completions = await db.select().from(lessonCompletions).where(eq(lessonCompletions.userId, userId));
      return completions.map((completion) => completion.lessonId);
    },
    [],
  );
}

// Quizzes
export async function getQuizForLesson(lessonId: string) {
  try {
    const quizRes = await db.select().from(quizzes).where(eq(quizzes.lessonId, lessonId)).limit(1);
    if (!quizRes.length) return null;
    const quiz = quizRes[0];
    const questions = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, quiz.id));
    return { ...quiz, questions };
  } catch (err) {
    console.error('[Queries] Error in getQuizForLesson:', err);
    return null;
  }
}

export async function submitQuizAttempt(userId: string, quizId: string, score: number, passed: boolean) {
  try {
    const previousPass = await db.select().from(quizAttempts).where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.quizId, quizId), eq(quizAttempts.passed, true))).limit(1);
    await db.insert(quizAttempts).values({ id: `attempt-${Date.now()}`, userId, quizId, score, passed });
    if (passed && previousPass.length === 0) {
      const quizRes = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);
      if (quizRes.length) await db.update(users).set({ points: sql`${users.points} + ${quizRes[0].points}` }).where(eq(users.id, userId));
    }
  } catch (err) {
    console.error('[Queries] Error in submitQuizAttempt:', err);
  }
}

// Assignments
export async function getAssignmentForLesson(lessonId: string) {
  try {
    const res = await db.select().from(assignments).where(eq(assignments.lessonId, lessonId)).limit(1);
    if (res.length) return res[0];
  } catch (err) {
    console.error('[Queries] Error in getAssignmentForLesson:', err);
  }
  return null;
}

export async function submitAssignment(userId: string, assignmentId: string, repoUrl: string, demoUrl?: string, notes?: string) {
  const newSubmission = {
    id: `sub-${Date.now()}`,
    assignmentId,
    userId,
    repoUrl,
    demoUrl: demoUrl || null,
    notes: notes || null,
    status: 'pending' as const,
    pointsAwarded: 0,
    feedback: null,
    submittedAt: new Date(),
    reviewedAt: null,
  };

  const inserted = await db.insert(assignmentSubmissions).values(newSubmission).returning();
  return inserted[0] || newSubmission;
}

export async function updateAssignmentSubmission(submissionId: string, userId: string, repoUrl: string, demoUrl?: string, notes?: string) {
  const values = { repoUrl, demoUrl: demoUrl || null, notes: notes || null, status: 'pending' as const, pointsAwarded: 0, feedback: null, submittedAt: new Date(), reviewedAt: null };
  const updated = await db.update(assignmentSubmissions).set(values).where(and(eq(assignmentSubmissions.id, submissionId), eq(assignmentSubmissions.userId, userId))).returning();
  if (!updated.length) throw new Error('Submission not found');
  return updated[0];
}

export async function getUserSubmissions(userId: string) {
  try {
    return await db.select().from(assignmentSubmissions).where(eq(assignmentSubmissions.userId, userId)).orderBy(desc(assignmentSubmissions.submittedAt));
  } catch (err) {
    console.error('[Queries] Error in getUserSubmissions:', err);
    return [];
  }
}

export async function getUserSubmissionForAssignment(userId: string, assignmentId: string) {
  try {
    const submissions = await db
      .select()
      .from(assignmentSubmissions)
      .where(and(eq(assignmentSubmissions.userId, userId), eq(assignmentSubmissions.assignmentId, assignmentId)))
      .orderBy(desc(assignmentSubmissions.submittedAt))
      .limit(1);
    return submissions[0] || null;
  } catch (err) {
    console.error('[Queries] Error in getUserSubmissionForAssignment:', err);
    return null;
  }
}

export async function getAllPendingSubmissions() {
  try {
    const subs = await db.select().from(assignmentSubmissions).where(eq(assignmentSubmissions.status, 'pending')).orderBy(desc(assignmentSubmissions.submittedAt));
    const result = [];
    for (const s of subs) {
      const u = await getUserById(s.userId);
      const assRes = await db.select().from(assignments).where(eq(assignments.id, s.assignmentId)).limit(1);
      result.push({
        ...s,
        user: u,
        assignment: assRes[0] || null
      });
    }
    return result;
  } catch (err) {
    console.error('[Queries] Error in getAllPendingSubmissions:', err);
    return [];
  }
}

export async function reviewAssignmentSubmission(submissionId: string, status: 'accepted' | 'rejected', pointsAwarded: number, feedback: string) {
  try {
    await db.update(assignmentSubmissions)
      .set({ status, pointsAwarded, feedback, reviewedAt: new Date() })
      .where(eq(assignmentSubmissions.id, submissionId));
    
    if (status === 'accepted' && pointsAwarded > 0) {
      const subRes = await db.select().from(assignmentSubmissions).where(eq(assignmentSubmissions.id, submissionId)).limit(1);
      if (subRes.length) {
        await db.update(users).set({ points: sql`${users.points} + ${pointsAwarded}` }).where(eq(users.id, subRes[0].userId));
      }
    }
  } catch (err) {
    console.error('[Queries] Error in reviewAssignmentSubmission:', err);
  }
}

// Leaderboard
export async function getLeaderboard() {
  try {
    return await db.select({
      id: users.id,
      name: users.name,
      username: users.username,
      avatarUrl: users.avatarUrl,
      points: users.points,
      role: users.role
    }).from(users).orderBy(desc(users.points)).limit(50);
  } catch (err) {
    console.error('[Queries] Error in getLeaderboard:', err);
    return [];
  }
}

// Job Postings
export async function getAllJobPostings() {
  try {
    return await db.select().from(jobPostings).orderBy(desc(jobPostings.createdAt));
  } catch (err) {
    console.error('[Queries] Error in getAllJobPostings:', err);
    return [];
  }
}

export async function createJobPosting(jobData: { title: string; company: string; logoUrl?: string; location: string; type: string; salary?: string; description: string; applyUrl: string }) {
  const newJob = {
    id: `job-${Date.now()}`,
    ...jobData,
    logoUrl: jobData.logoUrl || null,
    salary: jobData.salary || null,
    createdAt: new Date(),
  };

  const inserted = await db.insert(jobPostings).values(newJob).returning();
  return inserted[0] || newJob;
}

// Community Lounge Chat
export async function getCommunityMessages(courseId?: string) {
  return withDatabaseFallback(
    'getCommunityMessages',
    async () => {
      const query = courseId ? eq(communityMessages.courseId, courseId) : undefined;
      const rows = await db
        .select({ message: communityMessages, user: users })
        .from(communityMessages)
        .leftJoin(users, eq(communityMessages.userId, users.id))
        .where(query)
        .orderBy(communityMessages.createdAt)
        .limit(100);
      return rows.map(({ message, user }) => ({ ...message, user }));
    },
    [],
  );
}

export async function sendCommunityMessage(userId: string, content: string, courseId?: string) {
  const newMsg = {
    id: `msg-${Date.now()}`,
    userId,
    courseId: courseId || null,
    content,
    createdAt: new Date()
  };

  await db.insert(communityMessages).values(newMsg);
  const user = await getUserById(userId);
  return { ...newMsg, user };
}

// Admin Course & Module & Lesson Builder Queries
export async function createCourse(data: { title: string; slug: string; description: string; level?: string; thumbnailUrl?: string }) {
  const newCourse = {
    id: `course-${Date.now()}`,
    title: data.title,
    slug: data.slug.toLowerCase().replace(/\s+/g, '-'),
    description: data.description,
    level: data.level || 'Beginner',
    thumbnailUrl: data.thumbnailUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    isPublished: true,
    createdAt: new Date(),
  };

  const inserted = await db.insert(courses).values(newCourse).returning();
  return inserted[0] || newCourse;
}

export async function createModule(data: { courseId: string; title: string; orderIndex?: number }) {
  const newMod = {
    id: `mod-${Date.now()}`,
    courseId: data.courseId,
    title: data.title,
    orderIndex: data.orderIndex ?? 1
  };

  const inserted = await db.insert(modules).values(newMod).returning();
  return inserted[0] || newMod;
}

export async function createLesson(data: {
  moduleId: string;
  title: string;
  type: 'video' | 'markdown' | 'code';
  videoUrl?: string;
  markdownContent?: string;
  initialCode?: string;
  solutionCode?: string;
  language?: string;
  orderIndex?: number;
  durationMinutes?: number;
  points?: number;
}) {
  const newLesson = {
    id: `lesson-${Date.now()}`,
    moduleId: data.moduleId,
    title: data.title,
    type: data.type,
    videoUrl: data.videoUrl || null,
    markdownContent: data.markdownContent || null,
    initialCode: data.initialCode || null,
    solutionCode: data.solutionCode || null,
    language: data.language || 'javascript',
    orderIndex: data.orderIndex ?? 1,
    durationMinutes: data.durationMinutes || 15,
    points: data.points || 25,
  };

  const inserted = await db.insert(lessons).values(newLesson).returning();
  return inserted[0] || newLesson;
}

export async function deleteCourse(courseId: string) {
  await db.delete(courses).where(eq(courses.id, courseId));
}

export async function deleteJobPosting(jobId: string) {
  await db.delete(jobPostings).where(eq(jobPostings.id, jobId));
}

export async function createQuiz(data: { lessonId?: string; courseId?: string; title: string; passingScore?: number; points?: number }) {
  const newQuiz = {
    id: `quiz-${Date.now()}`,
    lessonId: data.lessonId || null,
    courseId: data.courseId || null,
    title: data.title,
    passingScore: data.passingScore || 70,
    points: data.points || 25
  };

  const inserted = await db.insert(quizzes).values(newQuiz).returning();
  return inserted[0] || newQuiz;
}

export async function createQuizQuestion(data: { quizId: string; question: string; options: string[]; correctOptionIndex: number; explanation?: string }) {
  const newQ = {
    id: `qq-${Date.now()}-${Math.random()}`,
    quizId: data.quizId,
    question: data.question,
    options: data.options,
    correctOptionIndex: data.correctOptionIndex,
    explanation: data.explanation || null
  };

  const inserted = await db.insert(quizQuestions).values(newQ).returning();
  return inserted[0] || newQ;
}
