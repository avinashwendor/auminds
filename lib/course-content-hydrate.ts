import {
  fetchCourseContentAsset,
  parseQuizQuestionsFromBlob,
  type QuizQuestionBlob,
} from './course-content-blob';

type LessonRecord = {
  markdownContent?: string | null;
  markdownUrl?: string | null;
  initialCode?: string | null;
  initialCodeUrl?: string | null;
  solutionCode?: string | null;
  solutionCodeUrl?: string | null;
};

type QuizRecord = {
  questionsUrl?: string | null;
};

type AssignmentRecord = {
  instructions?: string | null;
  instructionsUrl?: string | null;
};

async function resolveTextField(
  inline: string | null | undefined,
  url: string | null | undefined,
): Promise<string | null> {
  if (url) {
    const remote = await fetchCourseContentAsset(url);
    if (remote) return remote;
  }
  return inline ?? null;
}

export async function hydrateLessonContent<T extends LessonRecord>(lesson: T): Promise<T> {
  const [markdownContent, initialCode, solutionCode] = await Promise.all([
    resolveTextField(lesson.markdownContent, lesson.markdownUrl),
    resolveTextField(lesson.initialCode, lesson.initialCodeUrl),
    resolveTextField(lesson.solutionCode, lesson.solutionCodeUrl),
  ]);

  return {
    ...lesson,
    markdownContent,
    initialCode,
    solutionCode,
  };
}

export async function hydrateQuizQuestions<T extends QuizRecord>(
  quiz: T,
  fallbackQuestions: QuizQuestionBlob[] = [],
): Promise<T & { questions: QuizQuestionBlob[] }> {
  if (quiz.questionsUrl) {
    const remote = await parseQuizQuestionsFromBlob(quiz.questionsUrl);
    if (remote?.length) {
      return { ...quiz, questions: remote };
    }
  }

  return { ...quiz, questions: fallbackQuestions };
}

export async function hydrateAssignmentInstructions<T extends AssignmentRecord>(
  assignment: T,
): Promise<T> {
  const instructions = await resolveTextField(assignment.instructions, assignment.instructionsUrl);
  return {
    ...assignment,
    instructions: instructions ?? assignment.instructions,
  };
}

export async function hydrateCourseLessons<T extends { modules: Array<{ lessons?: LessonRecord[] }> }>(
  course: T,
): Promise<T> {
  const modules = await Promise.all(
    course.modules.map(async (module) => ({
      ...module,
      lessons: module.lessons
        ? await Promise.all(module.lessons.map((lesson) => hydrateLessonContent(lesson)))
        : [],
    })),
  );

  return { ...course, modules };
}
