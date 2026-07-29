import type { AccountStatus } from '@/lib/db/schema';

export type StudentActivityType = 'lesson' | 'quiz' | 'assignment';

export interface StudentActivityItem {
  id: string;
  type: StudentActivityType;
  title: string;
  courseTitle: string;
  courseSlug: string;
  timestamp: string;
  meta: {
    score?: number;
    passed?: boolean;
    status?: string;
    lessonType?: string;
    pointsAwarded?: number;
  };
}

export interface StudentCourseProgress {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}

export interface AdminStudentProgressRecord {
  userId: string;
  name: string;
  username: string;
  email: string | null;
  points: number;
  status: AccountStatus;
  avatarUrl: string | null;
  courses: StudentCourseProgress[];
  recentActivity: StudentActivityItem[];
  stats: {
    lessonsCompleted: number;
    quizzesAttempted: number;
    quizzesPassed: number;
    assignmentsSubmitted: number;
    assignmentsAccepted: number;
  };
  lastActiveAt: string | null;
}

export interface AdminStudentProgressResponse {
  students: AdminStudentProgressRecord[];
  courses: Array<{ id: string; title: string; slug: string }>;
}
