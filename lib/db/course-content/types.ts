export interface QuizQuestionDef {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface QuizDef {
  id: string;
  title: string;
  description?: string;
  passingScore?: number;
  points?: number;
  timeLimitMinutes?: number | null;
  maxAttempts?: number | null;
  shuffleQuestions?: boolean;
  questions: QuizQuestionDef[];
}

export interface AssignmentDef {
  id: string;
  title: string;
  instructions: string;
  maxPoints?: number;
}

export interface LessonDef {
  id: string;
  title: string;
  type: 'video' | 'markdown' | 'code';
  orderIndex: number;
  durationMinutes?: number;
  points?: number;
  videoUrl?: string;
  markdownContent?: string;
  initialCode?: string;
  solutionCode?: string;
  language?: string;
  quiz?: QuizDef;
  assignment?: AssignmentDef;
}

export interface ModuleDef {
  id: string;
  title: string;
  orderIndex: number;
  lessons: LessonDef[];
}

export interface CourseContentDef {
  slug: string;
  modules: ModuleDef[];
}
