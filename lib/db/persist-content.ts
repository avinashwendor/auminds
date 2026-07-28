import { eq } from 'drizzle-orm';
import { db } from './index';
import { courses, modules } from './schema';
import {
  uploadCourseContentAsset,
  uploadQuizQuestionsToBlob,
  isBlobStorageConfigured,
} from '../course-content-blob';

export async function getCourseSlugForModule(moduleId: string): Promise<string | null> {
  const rows = await db
    .select({ slug: courses.slug })
    .from(modules)
    .innerJoin(courses, eq(modules.courseId, courses.id))
    .where(eq(modules.id, moduleId))
    .limit(1);

  return rows[0]?.slug ?? null;
}

export interface LessonContentInput {
  markdownContent?: string | null;
  initialCode?: string | null;
  solutionCode?: string | null;
}

export interface LessonContentUrls {
  markdownUrl?: string | null;
  initialCodeUrl?: string | null;
  solutionCodeUrl?: string | null;
  markdownContent?: string | null;
  initialCode?: string | null;
  solutionCode?: string | null;
}

/**
 * Uploads lesson body content to blob storage and returns DB-ready fields.
 * When blob is configured, inline text is cleared and URLs are stored instead.
 */
export async function persistLessonContentToBlob(
  courseSlug: string,
  lessonId: string,
  content: LessonContentInput,
): Promise<LessonContentUrls> {
  if (!isBlobStorageConfigured()) {
    return {
      markdownContent: content.markdownContent ?? null,
      initialCode: content.initialCode ?? null,
      solutionCode: content.solutionCode ?? null,
    };
  }

  const result: LessonContentUrls = {
    markdownContent: null,
    initialCode: null,
    solutionCode: null,
    markdownUrl: null,
    initialCodeUrl: null,
    solutionCodeUrl: null,
  };

  if (content.markdownContent) {
    const uploaded = await uploadCourseContentAsset(
      courseSlug,
      'lessons',
      lessonId,
      'markdown',
      content.markdownContent,
    );
    result.markdownUrl = uploaded.url;
  }

  if (content.initialCode) {
    const uploaded = await uploadCourseContentAsset(
      courseSlug,
      'lessons',
      lessonId,
      'initial-code',
      content.initialCode,
    );
    result.initialCodeUrl = uploaded.url;
  }

  if (content.solutionCode) {
    const uploaded = await uploadCourseContentAsset(
      courseSlug,
      'lessons',
      lessonId,
      'solution-code',
      content.solutionCode,
    );
    result.solutionCodeUrl = uploaded.url;
  }

  return result;
}

export async function persistQuizQuestionsToBlob(
  courseSlug: string,
  quizId: string,
  questions: Array<{
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation?: string | null;
  }>,
): Promise<{ questionsUrl: string | null }> {
  if (!isBlobStorageConfigured() || !questions.length) {
    return { questionsUrl: null };
  }

  const uploaded = await uploadQuizQuestionsToBlob(courseSlug, quizId, questions);
  return { questionsUrl: uploaded.url };
}

export async function persistAssignmentInstructionsToBlob(
  courseSlug: string,
  assignmentId: string,
  instructions: string,
): Promise<{ instructionsUrl: string | null; instructions: string | null }> {
  if (!isBlobStorageConfigured()) {
    return { instructionsUrl: null, instructions };
  }

  const uploaded = await uploadCourseContentAsset(
    courseSlug,
    'assignments',
    assignmentId,
    'assignment-instructions',
    instructions,
  );

  return {
    instructionsUrl: uploaded.url,
    instructions: null,
  };
}
