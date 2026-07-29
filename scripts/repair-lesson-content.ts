/**
 * Restores inline lesson/assignment content in Postgres from S3 blob URLs.
 * Run after a migration that cleared inline fields — fixes prod when S3 env is missing on read path.
 *
 * Usage:
 *   DATABASE_URL=... S3_*=... npx tsx scripts/repair-lesson-content.ts
 */
import { eq, isNotNull, or, sql } from 'drizzle-orm';
import { db } from '../lib/db';
import { lessons, assignments, quizzes } from '../lib/db/schema';
import { fetchContentFromBlob } from '../lib/storage';
import { parseQuizQuestionsFromBlob } from '../lib/course-content-blob';
import { quizQuestions } from '../lib/db/schema';

async function repairLessons() {
  const rows = await db
    .select()
    .from(lessons)
    .where(
      or(
        isNotNull(lessons.markdownUrl),
        isNotNull(lessons.initialCodeUrl),
        isNotNull(lessons.solutionCodeUrl),
      ),
    );

  let repaired = 0;

  for (const lesson of rows) {
    const updates: Record<string, string | null> = {};

    if (!lesson.markdownContent && lesson.markdownUrl) {
      updates.markdownContent = await fetchContentFromBlob(lesson.markdownUrl);
    }
    if (!lesson.initialCode && lesson.initialCodeUrl) {
      updates.initialCode = await fetchContentFromBlob(lesson.initialCodeUrl);
    }
    if (!lesson.solutionCode && lesson.solutionCodeUrl) {
      updates.solutionCode = await fetchContentFromBlob(lesson.solutionCodeUrl);
    }

    if (Object.keys(updates).length) {
      await db.update(lessons).set(updates).where(eq(lessons.id, lesson.id));
      console.log(`  ↻ Restored lesson: ${lesson.title}`);
      repaired++;
    }
  }

  return repaired;
}

async function repairAssignments() {
  const rows = await db
    .select()
    .from(assignments)
    .where(isNotNull(assignments.instructionsUrl));

  let repaired = 0;

  for (const assignment of rows) {
    if (assignment.instructions || !assignment.instructionsUrl) continue;

    const instructions = await fetchContentFromBlob(assignment.instructionsUrl);
    if (instructions) {
      await db.update(assignments).set({ instructions }).where(eq(assignments.id, assignment.id));
      console.log(`  ↻ Restored assignment: ${assignment.title}`);
      repaired++;
    }
  }

  return repaired;
}

async function repairQuizQuestions() {
  const rows = await db
    .select()
    .from(quizzes)
    .where(isNotNull(quizzes.questionsUrl));

  let repaired = 0;

  for (const quiz of rows) {
    const existing = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quiz.id));

    if (Number(existing[0]?.total) > 0) continue;

    const questions = await parseQuizQuestionsFromBlob(quiz.questionsUrl!);
    if (!questions?.length) continue;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await db.insert(quizQuestions).values({
        id: q.id,
        quizId: quiz.id,
        question: q.question,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation || null,
        orderIndex: i,
      });
    }

    console.log(`  ↻ Restored quiz questions: ${quiz.title} (${questions.length})`);
    repaired++;
  }

  return repaired;
}

async function main() {
  console.log('🔧 Repairing inline content from S3 blobs...\n');

  const lessonCount = await repairLessons();
  const assignmentCount = await repairAssignments();
  const quizCount = await repairQuizQuestions();

  console.log(`\n✅ Done — ${lessonCount} lessons, ${assignmentCount} assignments, ${quizCount} quizzes restored.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Repair failed:', err);
    process.exit(1);
  });
