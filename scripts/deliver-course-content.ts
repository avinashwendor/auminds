import { eq } from 'drizzle-orm';
import { db } from '../lib/db';
import { lessons, modules, quizzes, quizQuestions, assignments } from '../lib/db/schema';
import {
  createLesson,
  updateLesson,
  updateModule,
  getCourseBySlug,
  createQuiz,
  createAssignment,
  deleteQuiz,
} from '../lib/db/queries';
import { getCourseContent, listDeliverableCourseSlugs } from '../lib/db/course-content';
import type { AssignmentDef, LessonDef, QuizDef } from '../lib/db/course-content';
import {
  persistLessonContentToBlob,
  persistQuizQuestionsToBlob,
  persistAssignmentInstructionsToBlob,
} from '../lib/db/persist-content';
import { isBlobStorageConfigured } from '../lib/course-content-blob';
import { ensureSchema } from './init-db';

async function upsertLesson(moduleId: string, courseSlug: string, def: LessonDef) {
  const existing = await db.select().from(lessons).where(eq(lessons.id, def.id)).limit(1);

  const blobFields = await persistLessonContentToBlob(courseSlug, def.id, {
    markdownContent: def.markdownContent,
    initialCode: def.initialCode,
    solutionCode: def.solutionCode,
  });

  const payload = {
    title: def.title,
    type: def.type,
    videoUrl: def.videoUrl || null,
    language: def.language || 'javascript',
    orderIndex: def.orderIndex,
    durationMinutes: def.durationMinutes || 15,
    points: def.points || 25,
    ...blobFields,
  };

  if (existing.length) {
    await updateLesson(def.id, payload);
    const storage = blobFields.markdownUrl || blobFields.initialCodeUrl ? 'blob' : 'inline';
    console.log(`  ↻ Updated lesson: ${def.title} [${storage}]`);
    return existing[0];
  }

  const created = await createLesson({ id: def.id, moduleId, ...payload });
  const storage = blobFields.markdownUrl || blobFields.initialCodeUrl ? 'blob' : 'inline';
  console.log(`  + Created lesson: ${def.title} [${storage}]`);
  return created;
}

async function replaceQuizQuestions(quizId: string, questions: QuizDef['questions']) {
  await db.delete(quizQuestions).where(eq(quizQuestions.quizId, quizId));

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    await db.insert(quizQuestions).values({
      id: `qq-${quizId}-${i}`,
      quizId,
      question: q.question,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation || null,
      orderIndex: i,
    });
  }
}

async function upsertQuiz(
  lessonId: string,
  courseId: string,
  courseSlug: string,
  def: QuizDef,
) {
  const existing = await db.select().from(quizzes).where(eq(quizzes.id, def.id)).limit(1);
  const { questionsUrl } = await persistQuizQuestionsToBlob(courseSlug, def.id, def.questions);

  const quizPayload = {
    lessonId,
    courseId: null as string | null,
    title: def.title,
    description: def.description || null,
    passingScore: def.passingScore || 70,
    points: def.points || 25,
    timeLimitMinutes: def.timeLimitMinutes ?? null,
    maxAttempts: def.maxAttempts ?? null,
    shuffleQuestions: def.shuffleQuestions ?? false,
    questionsUrl,
  };

  if (existing.length) {
    await db.update(quizzes).set(quizPayload).where(eq(quizzes.id, def.id));
  } else {
    await createQuiz({ id: def.id, ...quizPayload });
  }

  // Keep DB rows as fallback when blob is unavailable; skip duplicate storage when blob is primary
  if (!questionsUrl) {
    await replaceQuizQuestions(def.id, def.questions);
  }

  const storage = questionsUrl ? 'blob' : 'inline';
  console.log(`    ↻ Quiz: ${def.title} (${def.questions.length} questions) [${storage}]`);
}

async function upsertAssignment(
  lessonId: string,
  courseId: string,
  courseSlug: string,
  def: AssignmentDef,
) {
  const existing = await db.select().from(assignments).where(eq(assignments.id, def.id)).limit(1);
  const blobFields = await persistAssignmentInstructionsToBlob(courseSlug, def.id, def.instructions);

  const payload = {
    lessonId,
    courseId,
    title: def.title,
    instructions: blobFields.instructions ?? def.instructions,
    instructionsUrl: blobFields.instructionsUrl,
    maxPoints: def.maxPoints || 50,
  };

  if (existing.length) {
    await db.update(assignments).set(payload).where(eq(assignments.id, def.id));
  } else {
    await createAssignment({ id: def.id, ...payload });
  }

  const storage = blobFields.instructionsUrl ? 'blob' : 'inline';
  console.log(`    ↻ Assignment: ${def.title} [${storage}]`);
}

async function cleanupOrphanQuizzes(courseId: string, validQuizIds: Set<string>) {
  const courseQuizzes = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.courseId, courseId));

  const lessonQuizzes = await db
    .select({ quiz: quizzes })
    .from(quizzes)
    .innerJoin(lessons, eq(quizzes.lessonId, lessons.id))
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .where(eq(modules.courseId, courseId));

  const all = [...courseQuizzes, ...lessonQuizzes.map((r) => r.quiz)];

  for (const quiz of all) {
    if (!validQuizIds.has(quiz.id)) {
      await deleteQuiz(quiz.id);
      console.log(`  🗑 Removed orphan quiz: ${quiz.title}`);
    }
  }
}

export async function deliverCourseContent(slug?: string) {
  const slugs = slug ? [slug] : listDeliverableCourseSlugs();

  console.log('📚 Course Content Delivery');
  console.log('──────────────────────────');
  if (isBlobStorageConfigured()) {
    console.log('☁️  Blob storage: configured — content will be uploaded to S3');
  } else {
    console.log('⚠️  Blob storage: not configured — content will remain inline in Postgres');
  }

  await ensureSchema();

  for (const courseSlug of slugs) {
    const def = getCourseContent(courseSlug);
    const course = await getCourseBySlug(courseSlug);

    if (!course) {
      console.warn(`⚠️  Course not found in DB for slug "${courseSlug}" — skipping.`);
      continue;
    }

    console.log(`\n🎓 Delivering: ${course.title} (${courseSlug})`);
    const validQuizIds = new Set<string>();

    for (const modDef of def.modules) {
      await updateModule(modDef.id, {
        title: modDef.title,
        orderIndex: modDef.orderIndex,
      });
      console.log(`\n📁 ${modDef.title}`);

      for (const lessonDef of modDef.lessons) {
        await upsertLesson(modDef.id, courseSlug, lessonDef);

        if (lessonDef.quiz) {
          validQuizIds.add(lessonDef.quiz.id);
          await upsertQuiz(lessonDef.id, course.id, courseSlug, lessonDef.quiz);
        }

        if (lessonDef.assignment) {
          await upsertAssignment(lessonDef.id, course.id, courseSlug, lessonDef.assignment);
        }
      }
    }

    await cleanupOrphanQuizzes(course.id, validQuizIds);
    console.log(`\n✅ Delivered ${def.modules.length} modules for "${course.title}"`);
  }
}

if (require.main === module) {
  const slug = process.argv[2];
  deliverCourseContent(slug)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Course delivery failed:', err);
      process.exit(1);
    });
}
