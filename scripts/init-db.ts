import { isDatabaseAvailable, db } from '../lib/db';
import { initialSeedData } from '../lib/db/seed-data';
import { users } from '../lib/db/schema';
import { sql } from 'drizzle-orm';

export async function ensureSchema() {
  console.log('[DB-Init] Checking database connection and schema...');
  const available = await isDatabaseAvailable({ force: true });
  if (!available) {
    console.warn('[DB-Init] Database connection unavailable. Skipping schema synchronization.');
    return;
  }

  try {
    // 1. Create tables if they do not exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY,
        username text NOT NULL UNIQUE,
        email text,
        password_hash text NOT NULL,
        name text NOT NULL,
        role text NOT NULL DEFAULT 'student',
        status text NOT NULL DEFAULT 'approved',
        status_note text,
        signup_goal text,
        reviewed_at timestamp,
        reviewed_by text,
        points integer NOT NULL DEFAULT 0,
        avatar_url text,
        created_at timestamp NOT NULL DEFAULT now()
      );
    `);

    // 2. Add columns individually if migrating from older database schemas
    const alterColumns = [
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS username text;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS email text;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS name text;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'student';`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved';`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS status_note text;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_goal text;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS reviewed_at timestamp;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS reviewed_by text;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS points integer NOT NULL DEFAULT 0;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at timestamp NOT NULL DEFAULT now();`,
      `UPDATE users SET status = 'approved' WHERE status IS NULL;`,
      
      // Course Enrollments missing columns
      `ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS assigned_by text;`,
      `ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS enrolled_at timestamp NOT NULL DEFAULT now();`,

      // Quizzes & Quiz Attempts missing columns
      `ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS time_limit_minutes integer;`,
      `ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS max_attempts integer;`,
      `ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS shuffle_questions boolean NOT NULL DEFAULT false;`,
      `ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS correct_count integer NOT NULL DEFAULT 0;`,
      `ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS total_questions integer NOT NULL DEFAULT 0;`,
      `ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS duration_seconds integer;`,
      `ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS answers jsonb;`,

      // Assignment Submissions missing columns
      `ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS points_awarded integer NOT NULL DEFAULT 0;`,
      `ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS feedback text;`,
      `ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS reviewed_at timestamp;`,
    ];

    for (const stmt of alterColumns) {
      try {
        await db.execute(sql.raw(stmt));
      } catch (err: any) {
        // Ignore harmless notices
      }
    }

    // 3. Ensure other LMS tables exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS courses (
        id text PRIMARY KEY,
        title text NOT NULL,
        slug text NOT NULL UNIQUE,
        description text NOT NULL,
        thumbnail_url text,
        level text NOT NULL DEFAULT 'Beginner',
        is_published boolean NOT NULL DEFAULT true,
        created_at timestamp NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS course_enrollments (
        id text PRIMARY KEY,
        user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id text NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        assigned_by text,
        enrolled_at timestamp NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS modules (
        id text PRIMARY KEY,
        course_id text NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title text NOT NULL,
        order_index integer NOT NULL
      );

      CREATE TABLE IF NOT EXISTS lessons (
        id text PRIMARY KEY,
        module_id text NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
        title text NOT NULL,
        type text NOT NULL DEFAULT 'video',
        video_url text,
        markdown_content text,
        initial_code text,
        solution_code text,
        language text DEFAULT 'javascript',
        order_index integer NOT NULL,
        duration_minutes integer NOT NULL DEFAULT 10,
        points integer NOT NULL DEFAULT 15
      );

      CREATE TABLE IF NOT EXISTS lesson_completions (
        id text PRIMARY KEY,
        user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lesson_id text NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        completed_at timestamp NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS quizzes (
        id text PRIMARY KEY,
        lesson_id text REFERENCES lessons(id) ON DELETE CASCADE,
        course_id text REFERENCES courses(id) ON DELETE CASCADE,
        title text NOT NULL,
        description text,
        passing_score integer NOT NULL DEFAULT 70,
        points integer NOT NULL DEFAULT 25,
        time_limit_minutes integer,
        max_attempts integer,
        shuffle_questions boolean NOT NULL DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS quiz_questions (
        id text PRIMARY KEY,
        quiz_id text NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        question text NOT NULL,
        options jsonb NOT NULL,
        correct_option_index integer NOT NULL,
        explanation text,
        order_index integer NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id text PRIMARY KEY,
        user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        quiz_id text NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        score integer NOT NULL,
        passed boolean NOT NULL,
        correct_count integer NOT NULL DEFAULT 0,
        total_questions integer NOT NULL DEFAULT 0,
        duration_seconds integer,
        answers jsonb,
        created_at timestamp NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS assignments (
        id text PRIMARY KEY,
        lesson_id text REFERENCES lessons(id) ON DELETE CASCADE,
        course_id text REFERENCES courses(id) ON DELETE CASCADE,
        title text NOT NULL,
        instructions text NOT NULL,
        max_points integer NOT NULL DEFAULT 50
      );

      CREATE TABLE IF NOT EXISTS assignment_submissions (
        id text PRIMARY KEY,
        assignment_id text NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
        user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        repo_url text NOT NULL,
        demo_url text,
        notes text,
        status text NOT NULL DEFAULT 'pending',
        points_awarded integer NOT NULL DEFAULT 0,
        feedback text,
        submitted_at timestamp NOT NULL DEFAULT now(),
        reviewed_at timestamp
      );

      CREATE TABLE IF NOT EXISTS job_postings (
        id text PRIMARY KEY,
        title text NOT NULL,
        company text NOT NULL,
        logo_url text,
        location text NOT NULL,
        type text NOT NULL DEFAULT 'Full-time',
        salary text,
        description text NOT NULL,
        apply_url text NOT NULL,
        created_at timestamp NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS community_messages (
        id text PRIMARY KEY,
        course_id text REFERENCES courses(id) ON DELETE CASCADE,
        user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content text NOT NULL,
        created_at timestamp NOT NULL DEFAULT now()
      );
    `);

    console.log('[DB-Init] Database tables and schema verified successfully.');

    // 4. Seed initial admin and demo data if users table is empty
    const userCountRes = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    if ((userCountRes[0]?.count || 0) === 0) {
      console.log('[DB-Init] Database is empty. Seeding initial admin and demo courses...');
      for (const u of initialSeedData.users) {
        await db.insert(users).values(u as any).onConflictDoNothing();
      }
      console.log('[DB-Init] Seeding completed.');
    }
  } catch (err: any) {
    console.error('[DB-Init] Schema sync notice:', err?.message || err);
  }
}

if (require.main === module) {
  ensureSchema()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(0);
    });
}
