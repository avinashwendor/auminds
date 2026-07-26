import { db, isDatabaseAvailable } from './index';
import { 
  users, courses, courseEnrollments, modules, lessons, 
  lessonCompletions, quizzes, quizQuestions, quizAttempts, 
  assignments, assignmentSubmissions, jobPostings, communityMessages 
} from './schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { initialSeedData } from './seed-data';

// Helper for fallback memory store when local Postgres is not active
let memoryStore = JSON.parse(JSON.stringify(initialSeedData));

// User Queries using Drizzle QueryBuilder
export async function getUserByUsername(username: string) {
  if (!(await isDatabaseAvailable())) {
    return memoryStore.users.find((u: any) => u.username.toLowerCase() === username.toLowerCase()) || null;
  }
  try {
    const result = await db.select().from(users).where(eq(users.username, username.toLowerCase())).limit(1);
    if (result.length > 0) return result[0];
  } catch (err) {
    return memoryStore.users.find((u: any) => u.username.toLowerCase() === username.toLowerCase()) || null;
  }
  return null;
}

export async function getUserById(id: string) {
  if (!(await isDatabaseAvailable())) {
    return memoryStore.users.find((u: any) => u.id === id) || null;
  }
  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (result.length > 0) return result[0];
  } catch (err) {
    return memoryStore.users.find((u: any) => u.id === id) || null;
  }
  return null;
}

export async function getAllUsers() {
  try {
    const result = await db.select().from(users).orderBy(desc(users.createdAt));
    if (result.length > 0) return result;
  } catch (err) {
    return memoryStore.users;
  }
  return memoryStore.users;
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

  try {
    const inserted = await db.insert(users).values(newUser).returning();
    const userObj = inserted[0] || newUser;

    if (userData.assignedCourseIds && userData.assignedCourseIds.length > 0) {
      for (const courseId of userData.assignedCourseIds) {
        await assignCourseToUser(userObj.id, courseId);
      }
    }
    return userObj;
  } catch (err) {
    memoryStore.users.push(newUser);
    if (userData.assignedCourseIds && userData.assignedCourseIds.length > 0) {
      for (const courseId of userData.assignedCourseIds) {
        memoryStore.courseEnrollments.push({
          id: `enroll-${Date.now()}-${Math.random()}`,
          userId: newUser.id,
          courseId,
          enrolledAt: new Date()
        });
      }
    }
    return newUser;
  }
}

export async function assignCourseToUser(userId: string, courseId: string) {
  try {
    await db.insert(courseEnrollments).values({
      userId,
      courseId,
    });
  } catch (err) {
    const exists = memoryStore.courseEnrollments.some((e: any) => e.userId === userId && e.courseId === courseId);
    if (!exists) {
      memoryStore.courseEnrollments.push({
        id: `enroll-${Date.now()}`,
        userId,
        courseId,
        enrolledAt: new Date()
      });
    }
  }
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
    const enrolledCourseIds = new Set(
      memoryStore.courseEnrollments
        .filter((enrollment: any) => enrollment.userId === userId)
        .map((enrollment: any) => enrollment.courseId),
    );
    return memoryStore.courses.filter((course: any) => enrolledCourseIds.has(course.id));
  }
}

export async function isUserEnrolledInCourse(userId: string, courseId: string) {
  if (!(await isDatabaseAvailable())) {
    return memoryStore.courseEnrollments.some((item: any) => item.userId === userId && item.courseId === courseId);
  }
  try {
    const enrollment = await db
      .select({ id: courseEnrollments.id })
      .from(courseEnrollments)
      .where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, courseId)))
      .limit(1);
    return enrollment.length > 0;
  } catch (err) {
    return memoryStore.courseEnrollments.some(
      (item: any) => item.userId === userId && item.courseId === courseId,
    );
  }
}

export async function getUserCourseTrees(userId: string) {
  if (!(await isDatabaseAvailable())) {
    const enrolledCourseIds = new Set(
      memoryStore.courseEnrollments
        .filter((enrollment: any) => enrollment.userId === userId)
        .map((enrollment: any) => enrollment.courseId),
    );
    return memoryStore.courses
      .filter((course: any) => enrolledCourseIds.has(course.id))
      .map((course: any) => ({
        ...course,
        modules: memoryStore.modules
          .filter((module: any) => module.courseId === course.id)
          .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
          .map((module: any) => ({
            ...module,
            lessons: memoryStore.lessons
              .filter((lesson: any) => lesson.moduleId === module.id)
              .sort((a: any, b: any) => a.orderIndex - b.orderIndex),
          })),
      }));
  }
  try {
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
  } catch (err) {
    const enrolledCourseIds = new Set(
      memoryStore.courseEnrollments
        .filter((enrollment: any) => enrollment.userId === userId)
        .map((enrollment: any) => enrollment.courseId),
    );
    return memoryStore.courses
      .filter((course: any) => enrolledCourseIds.has(course.id))
      .map((course: any) => ({
        ...course,
        modules: memoryStore.modules
          .filter((module: any) => module.courseId === course.id)
          .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
          .map((module: any) => ({
            ...module,
            lessons: memoryStore.lessons
              .filter((lesson: any) => lesson.moduleId === module.id)
              .sort((a: any, b: any) => a.orderIndex - b.orderIndex),
          })),
      }));
  }
}

// Course Queries
export async function getAllCourses() {
  if (!(await isDatabaseAvailable())) {
    return memoryStore.courses;
  }
  try {
    const result = await db.select().from(courses).orderBy(desc(courses.createdAt));
    if (result.length > 0) return result;
  } catch (err) {
    return memoryStore.courses;
  }
  return memoryStore.courses;
}

export async function getCourseBySlug(slug: string) {
  if (!(await isDatabaseAvailable())) {
    return memoryStore.courses.find((c: any) => c.slug === slug) || null;
  }
  try {
    const result = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
    if (result.length > 0) return result[0];
  } catch (err) {
    return memoryStore.courses.find((c: any) => c.slug === slug) || null;
  }
  return null;
}

export async function getCourseFullTree(courseId: string) {
  if (!(await isDatabaseAvailable())) {
    const course = memoryStore.courses.find((c: any) => c.id === courseId);
    if (!course) return null;

    const mods = memoryStore.modules
      .filter((m: any) => m.courseId === courseId)
      .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
      .map((m: any) => ({
        ...m,
        lessons: memoryStore.lessons
          .filter((l: any) => l.moduleId === m.id)
          .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
      }));

    return { ...course, modules: mods };
  }
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
    const course = memoryStore.courses.find((c: any) => c.id === courseId);
    if (!course) return null;

    const mods = memoryStore.modules
      .filter((m: any) => m.courseId === courseId)
      .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
      .map((m: any) => ({
        ...m,
        lessons: memoryStore.lessons
          .filter((l: any) => l.moduleId === m.id)
          .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
      }));

    return { ...course, modules: mods };
  }
}

// Lesson & Completion Queries
export async function getLessonById(lessonId: string) {
  if (!(await isDatabaseAvailable())) {
    return memoryStore.lessons.find((l: any) => l.id === lessonId) || null;
  }
  try {
    const result = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
    if (result.length > 0) return result[0];
  } catch (err) {
    return memoryStore.lessons.find((l: any) => l.id === lessonId) || null;
  }
  return null;
}

export async function markLessonCompleted(userId: string, lessonId: string) {
  if (!(await isDatabaseAvailable())) {
    const exists = memoryStore.lessonCompletions.some((c: any) => c.userId === userId && c.lessonId === lessonId);
    if (!exists) {
      memoryStore.lessonCompletions.push({
        id: `comp-${Date.now()}`,
        userId,
        lessonId,
        completedAt: new Date()
      });
      const user = memoryStore.users.find((u: any) => u.id === userId);
      const lesson = memoryStore.lessons.find((l: any) => l.id === lessonId);
      if (user && lesson) {
        user.points = (user.points || 0) + (lesson.points || 15);
      }
    }
    return;
  }
  try {
    const existing = await db.select().from(lessonCompletions).where(and(eq(lessonCompletions.userId, userId), eq(lessonCompletions.lessonId, lessonId))).limit(1);
    if (existing.length === 0) {
      await db.insert(lessonCompletions).values({ userId, lessonId });
      const lesson = await getLessonById(lessonId);
      if (lesson) {
        await db.update(users).set({ points: sql`${users.points} + ${lesson.points}` }).where(eq(users.id, userId));
      }
    }
  } catch (err) {
    const exists = memoryStore.lessonCompletions.some((c: any) => c.userId === userId && c.lessonId === lessonId);
    if (!exists) {
      memoryStore.lessonCompletions.push({
        id: `comp-${Date.now()}`,
        userId,
        lessonId,
        completedAt: new Date()
      });
      const user = memoryStore.users.find((u: any) => u.id === userId);
      const lesson = memoryStore.lessons.find((l: any) => l.id === lessonId);
      if (user && lesson) {
        user.points = (user.points || 0) + (lesson.points || 15);
      }
    }
  }
}

export async function getUserCompletedLessonIds(userId: string) {
  if (!(await isDatabaseAvailable())) {
    return memoryStore.lessonCompletions.filter((c: any) => c.userId === userId).map((c: any) => c.lessonId);
  }
  try {
    const completions = await db.select().from(lessonCompletions).where(eq(lessonCompletions.userId, userId));
    return completions.map(c => c.lessonId);
  } catch (err) {
    return memoryStore.lessonCompletions.filter((c: any) => c.userId === userId).map((c: any) => c.lessonId);
  }
}

// Quizzes
export async function getQuizForLesson(lessonId: string) {
  if (!(await isDatabaseAvailable())) {
    const quiz = memoryStore.quizzes.find((q: any) => q.lessonId === lessonId);
    if (!quiz) return null;
    const questions = memoryStore.quizQuestions.filter((qq: any) => qq.quizId === quiz.id);
    return { ...quiz, questions };
  }
  try {
    const quizRes = await db.select().from(quizzes).where(eq(quizzes.lessonId, lessonId)).limit(1);
    if (!quizRes.length) return null;
    const quiz = quizRes[0];
    const questions = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, quiz.id));
    return { ...quiz, questions };
  } catch (err) {
    const quiz = memoryStore.quizzes.find((q: any) => q.lessonId === lessonId);
    if (!quiz) return null;
    const questions = memoryStore.quizQuestions.filter((qq: any) => qq.quizId === quiz.id);
    return { ...quiz, questions };
  }
}

export async function submitQuizAttempt(userId: string, quizId: string, score: number, passed: boolean) {
  if (!(await isDatabaseAvailable())) {
    const previouslyPassed = memoryStore.quizAttempts.some((attempt: any) => attempt.userId === userId && attempt.quizId === quizId && attempt.passed);
    memoryStore.quizAttempts.push({ id: crypto.randomUUID(), userId, quizId, score, passed, createdAt: new Date() });
    if (passed && !previouslyPassed) {
      const user = memoryStore.users.find((item: any) => item.id === userId);
      const quiz = memoryStore.quizzes.find((item: any) => item.id === quizId);
      if (user && quiz) user.points = (user.points || 0) + (quiz.points || 25);
    }
    return;
  }
  try {
    const previousPass = await db.select().from(quizAttempts).where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.quizId, quizId), eq(quizAttempts.passed, true))).limit(1);
    await db.insert(quizAttempts).values({ userId, quizId, score, passed });
    if (passed && previousPass.length === 0) {
      const quizRes = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);
      if (quizRes.length) await db.update(users).set({ points: sql`${users.points} + ${quizRes[0].points}` }).where(eq(users.id, userId));
    }
  } catch (err) {
    const previouslyPassed = memoryStore.quizAttempts.some((attempt: any) => attempt.userId === userId && attempt.quizId === quizId && attempt.passed);
    memoryStore.quizAttempts.push({ id: crypto.randomUUID(), userId, quizId, score, passed, createdAt: new Date() });
    if (passed && !previouslyPassed) {
      const user = memoryStore.users.find((item: any) => item.id === userId);
      const quiz = memoryStore.quizzes.find((item: any) => item.id === quizId);
      if (user && quiz) user.points = (user.points || 0) + (quiz.points || 25);
    }
  }
}

// Assignments
export async function getAssignmentForLesson(lessonId: string) {
  if (!(await isDatabaseAvailable())) {
    return memoryStore.assignments.find((a: any) => a.lessonId === lessonId) || null;
  }
  try {
    const res = await db.select().from(assignments).where(eq(assignments.lessonId, lessonId)).limit(1);
    if (res.length) return res[0];
  } catch (err) {
    return memoryStore.assignments.find((a: any) => a.lessonId === lessonId) || null;
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

  try {
    const inserted = await db.insert(assignmentSubmissions).values(newSubmission).returning();
    return inserted[0] || newSubmission;
  } catch (err) {
    memoryStore.assignmentSubmissions.push(newSubmission);
    return newSubmission;
  }
}

export async function updateAssignmentSubmission(submissionId: string, userId: string, repoUrl: string, demoUrl?: string, notes?: string) {
  const values = { repoUrl, demoUrl: demoUrl || null, notes: notes || null, status: 'pending' as const, pointsAwarded: 0, feedback: null, submittedAt: new Date(), reviewedAt: null };
  try {
    const updated = await db.update(assignmentSubmissions).set(values).where(and(eq(assignmentSubmissions.id, submissionId), eq(assignmentSubmissions.userId, userId))).returning();
    if (!updated.length) throw new Error('Submission not found');
    return updated[0];
  } catch (err) {
    const submission = memoryStore.assignmentSubmissions.find((item: any) => item.id === submissionId && item.userId === userId);
    if (!submission) throw err;
    Object.assign(submission, values);
    return submission;
  }
}

export async function getUserSubmissions(userId: string) {
  try {
    return await db.select().from(assignmentSubmissions).where(eq(assignmentSubmissions.userId, userId)).orderBy(desc(assignmentSubmissions.submittedAt));
  } catch (err) {
    return memoryStore.assignmentSubmissions.filter((s: any) => s.userId === userId);
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
    return memoryStore.assignmentSubmissions
      .filter((submission: any) => submission.userId === userId && submission.assignmentId === assignmentId)
      .sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0] || null;
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
    return memoryStore.assignmentSubmissions
      .filter((s: any) => s.status === 'pending')
      .map((s: any) => ({
        ...s,
        user: memoryStore.users.find((u: any) => u.id === s.userId),
        assignment: memoryStore.assignments.find((a: any) => a.id === s.assignmentId)
      }));
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
    const sub = memoryStore.assignmentSubmissions.find((s: any) => s.id === submissionId);
    if (sub) {
      sub.status = status;
      sub.pointsAwarded = pointsAwarded;
      sub.feedback = feedback;
      sub.reviewedAt = new Date();

      if (status === 'accepted' && pointsAwarded > 0) {
        const user = memoryStore.users.find((u: any) => u.id === sub.userId);
        if (user) user.points = (user.points || 0) + pointsAwarded;
      }
    }
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
    return memoryStore.users
      .sort((a: any, b: any) => b.points - a.points)
      .map((u: any) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        avatarUrl: u.avatarUrl,
        points: u.points,
        role: u.role
      }));
  }
}

// Job Postings
export async function getAllJobPostings() {
  try {
    return await db.select().from(jobPostings).orderBy(desc(jobPostings.createdAt));
  } catch (err) {
    return memoryStore.jobPostings;
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

  try {
    const inserted = await db.insert(jobPostings).values(newJob).returning();
    return inserted[0] || newJob;
  } catch (err) {
    memoryStore.jobPostings.unshift(newJob);
    return newJob;
  }
}

// Community Lounge Chat
export async function getCommunityMessages(courseId?: string) {
  try {
    const query = courseId ? eq(communityMessages.courseId, courseId) : undefined;
    const rows = await db
      .select({ message: communityMessages, user: users })
      .from(communityMessages)
      .leftJoin(users, eq(communityMessages.userId, users.id))
      .where(query)
      .orderBy(communityMessages.createdAt)
      .limit(100);
    return rows.map(({ message, user }) => ({ ...message, user }));
  } catch (err) {
    return memoryStore.communityMessages
      .filter((message: any) => !courseId || message.courseId === courseId)
      .slice(-100)
      .map((message: any) => ({
        ...message,
        user: memoryStore.users.find((user: any) => user.id === message.userId) || null,
      }));
  }
}

export async function sendCommunityMessage(userId: string, content: string, courseId?: string) {
  const newMsg = {
    id: `msg-${Date.now()}`,
    userId,
    courseId: courseId || null,
    content,
    createdAt: new Date()
  };

  try {
    await db.insert(communityMessages).values(newMsg);
    const user = await getUserById(userId);
    return { ...newMsg, user };
  } catch (err) {
    memoryStore.communityMessages.push(newMsg);
    const user = memoryStore.users.find((u: any) => u.id === userId);
    return { ...newMsg, user };
  }
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

  try {
    const inserted = await db.insert(courses).values(newCourse).returning();
    return inserted[0] || newCourse;
  } catch (err) {
    memoryStore.courses.unshift(newCourse);
    return newCourse;
  }
}

export async function createModule(data: { courseId: string; title: string; orderIndex?: number }) {
  const newMod = {
    id: `mod-${Date.now()}`,
    courseId: data.courseId,
    title: data.title,
    orderIndex: data.orderIndex ?? (memoryStore.modules.length + 1)
  };

  try {
    const inserted = await db.insert(modules).values(newMod).returning();
    return inserted[0] || newMod;
  } catch (err) {
    memoryStore.modules.push(newMod);
    return newMod;
  }
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
    orderIndex: data.orderIndex ?? (memoryStore.lessons.length + 1),
    durationMinutes: data.durationMinutes || 15,
    points: data.points || 25,
  };

  try {
    const inserted = await db.insert(lessons).values(newLesson).returning();
    return inserted[0] || newLesson;
  } catch (err) {
    memoryStore.lessons.push(newLesson);
    return newLesson;
  }
}

export async function deleteCourse(courseId: string) {
  try {
    await db.delete(courses).where(eq(courses.id, courseId));
  } catch (err) {
    memoryStore.courses = memoryStore.courses.filter((c: any) => c.id !== courseId);
  }
}

export async function deleteJobPosting(jobId: string) {
  try {
    await db.delete(jobPostings).where(eq(jobPostings.id, jobId));
  } catch (err) {
    memoryStore.jobPostings = memoryStore.jobPostings.filter((j: any) => j.id !== jobId);
  }
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

  try {
    const inserted = await db.insert(quizzes).values(newQuiz).returning();
    return inserted[0] || newQuiz;
  } catch (err) {
    memoryStore.quizzes.push(newQuiz);
    return newQuiz;
  }
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

  try {
    const inserted = await db.insert(quizQuestions).values(newQ).returning();
    return inserted[0] || newQ;
  } catch (err) {
    memoryStore.quizQuestions.push(newQ);
    return newQ;
  }
}

