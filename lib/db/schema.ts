import { pgTable, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Account lifecycle: self-signups land on `pending` until an admin approves them.
export const ACCOUNT_STATUSES = ['pending', 'approved', 'rejected', 'suspended'] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email'),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role', { enum: ['admin', 'student'] }).notNull().default('student'),
  status: text('status', { enum: ACCOUNT_STATUSES }).notNull().default('pending'),
  statusNote: text('status_note'),
  signupGoal: text('signup_goal'),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: text('reviewed_by'),
  points: integer('points').notNull().default(0),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Courses table
export const courses = pgTable('courses', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  level: text('level').notNull().default('Beginner'),
  isPublished: boolean('is_published').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Course Enrollments (Admin assigns courses to specific students)
export const courseEnrollments = pgTable('course_enrollments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  assignedBy: text('assigned_by'),
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
});

// Modules table
export const modules = pgTable('modules', {
  id: text('id').primaryKey(),
  courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  orderIndex: integer('order_index').notNull(),
});

// Lessons table (Supports Video, Markdown, and Monaco Code Editor types)
export const lessons = pgTable('lessons', {
  id: text('id').primaryKey(),
  moduleId: text('module_id').notNull().references(() => modules.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  type: text('type', { enum: ['video', 'markdown', 'code'] }).notNull().default('video'),
  videoUrl: text('video_url'),
  markdownContent: text('markdown_content'),
  markdownUrl: text('markdown_url'),
  initialCode: text('initial_code'),
  initialCodeUrl: text('initial_code_url'),
  solutionCode: text('solution_code'),
  solutionCodeUrl: text('solution_code_url'),
  language: text('language').default('javascript'),
  orderIndex: integer('order_index').notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(10),
  points: integer('points').notNull().default(15),
});

// Lesson Completions
export const lessonCompletions = pgTable('lesson_completions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lessonId: text('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
});

// Quizzes
export const quizzes = pgTable('quizzes', {
  id: text('id').primaryKey(),
  lessonId: text('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }),
  courseId: text('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  passingScore: integer('passing_score').notNull().default(70),
  points: integer('points').notNull().default(25),
  // null = untimed, otherwise a countdown is shown and the attempt auto-submits
  timeLimitMinutes: integer('time_limit_minutes'),
  // null = unlimited retakes
  maxAttempts: integer('max_attempts'),
  shuffleQuestions: boolean('shuffle_questions').notNull().default(false),
  questionsUrl: text('questions_url'),
});

// Quiz Questions
export const quizQuestions = pgTable('quiz_questions', {
  id: text('id').primaryKey(),
  quizId: text('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  options: jsonb('options').$type<string[]>().notNull(),
  correctOptionIndex: integer('correct_option_index').notNull(),
  explanation: text('explanation'),
  orderIndex: integer('order_index').notNull().default(0),
});

// Quiz Attempts
export const quizAttempts = pgTable('quiz_attempts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  quizId: text('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  score: integer('score').notNull(),
  passed: boolean('passed').notNull(),
  correctCount: integer('correct_count').notNull().default(0),
  totalQuestions: integer('total_questions').notNull().default(0),
  durationSeconds: integer('duration_seconds'),
  // Map of questionId -> selected option index, used to rebuild the review screen
  answers: jsonb('answers').$type<Record<string, number>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Assignments
export const assignments = pgTable('assignments', {
  id: text('id').primaryKey(),
  lessonId: text('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }),
  courseId: text('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  instructions: text('instructions').notNull(),
  instructionsUrl: text('instructions_url'),
  maxPoints: integer('max_points').notNull().default(50),
});

// Assignment Submissions (Reviewed and accepted/rejected by Admin)
export const assignmentSubmissions = pgTable('assignment_submissions', {
  id: text('id').primaryKey(),
  assignmentId: text('assignment_id').notNull().references(() => assignments.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  repoUrl: text('repo_url').notNull(),
  demoUrl: text('demo_url'),
  notes: text('notes'),
  status: text('status', { enum: ['pending', 'accepted', 'rejected'] }).notNull().default('pending'),
  pointsAwarded: integer('points_awarded').notNull().default(0),
  feedback: text('feedback'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
});

// Job Postings Section
export const jobPostings = pgTable('job_postings', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  company: text('company').notNull(),
  logoUrl: text('logo_url'),
  location: text('location').notNull(),
  type: text('type').notNull().default('Full-time'),
  salary: text('salary'),
  description: text('description').notNull(),
  applyUrl: text('apply_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Community Lounge Chat Messages
export const communityMessages = pgTable('community_messages', {
  id: text('id').primaryKey(),
  courseId: text('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Define Drizzle Relations for clean QueryBuilder joins
export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(courseEnrollments),
  completions: many(lessonCompletions),
  submissions: many(assignmentSubmissions),
  quizAttempts: many(quizAttempts),
  messages: many(communityMessages),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  enrollments: many(courseEnrollments),
  modules: many(modules),
  quizzes: many(quizzes),
  assignments: many(assignments),
  messages: many(communityMessages),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, { fields: [modules.courseId], references: [courses.id] }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, { fields: [lessons.moduleId], references: [modules.id] }),
  completions: many(lessonCompletions),
  quizzes: many(quizzes),
  assignments: many(assignments),
}));
