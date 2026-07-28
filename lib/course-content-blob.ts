import {
  uploadContentObject,
  fetchContentFromBlob,
  isBlobStorageConfigured,
} from './storage';

export type CourseContentAsset =
  | 'markdown'
  | 'initial-code'
  | 'solution-code'
  | 'quiz-questions'
  | 'assignment-instructions';

const CONTENT_TYPES: Record<CourseContentAsset, string> = {
  markdown: 'text/markdown; charset=utf-8',
  'initial-code': 'text/javascript; charset=utf-8',
  'solution-code': 'text/javascript; charset=utf-8',
  'quiz-questions': 'application/json; charset=utf-8',
  'assignment-instructions': 'text/markdown; charset=utf-8',
};

const CONTENT_EXTENSIONS: Record<CourseContentAsset, string> = {
  markdown: 'content.md',
  'initial-code': 'initial.js',
  'solution-code': 'solution.js',
  'quiz-questions': 'questions.json',
  'assignment-instructions': 'instructions.md',
};

export function buildCourseContentKey(
  courseSlug: string,
  entity: 'lessons' | 'quizzes' | 'assignments',
  entityId: string,
  asset: CourseContentAsset,
): string {
  const cleanSlug = courseSlug.replace(/^\/+|\/+$/g, '');
  const fileName = CONTENT_EXTENSIONS[asset];
  return `courses/${cleanSlug}/${entity}/${entityId}/${fileName}`;
}

export async function uploadCourseContentAsset(
  courseSlug: string,
  entity: 'lessons' | 'quizzes' | 'assignments',
  entityId: string,
  asset: CourseContentAsset,
  body: string,
) {
  const key = buildCourseContentKey(courseSlug, entity, entityId, asset);
  const result = await uploadContentObject({
    key,
    body,
    contentType: CONTENT_TYPES[asset],
  });
  return { ...result, key };
}

export async function fetchCourseContentAsset(urlOrKey: string): Promise<string | null> {
  return fetchContentFromBlob(urlOrKey);
}

export interface QuizQuestionBlob {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string | null;
  orderIndex: number;
}

export function serializeQuizQuestions(
  quizId: string,
  questions: Array<{
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation?: string | null;
  }>,
): QuizQuestionBlob[] {
  return questions.map((q, index) => ({
    id: `qq-${quizId}-${index}`,
    question: q.question,
    options: q.options,
    correctOptionIndex: q.correctOptionIndex,
    explanation: q.explanation ?? null,
    orderIndex: index,
  }));
}

export async function uploadQuizQuestionsToBlob(
  courseSlug: string,
  quizId: string,
  questions: Array<{
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation?: string | null;
  }>,
) {
  const payload = serializeQuizQuestions(quizId, questions);
  return uploadCourseContentAsset(
    courseSlug,
    'quizzes',
    quizId,
    'quiz-questions',
    JSON.stringify({ questions: payload }, null, 2),
  );
}

export async function parseQuizQuestionsFromBlob(
  urlOrKey: string,
): Promise<QuizQuestionBlob[] | null> {
  const raw = await fetchCourseContentAsset(urlOrKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { questions?: QuizQuestionBlob[] };
    return Array.isArray(parsed.questions) ? parsed.questions : null;
  } catch {
    return null;
  }
}

export { isBlobStorageConfigured };
