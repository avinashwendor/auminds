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

    // 2. Add columns individually to existing users table if migrating from older schema
    const alterColumns = [
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved';`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS status_note text;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_goal text;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS reviewed_at timestamp;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS reviewed_by text;`,
      `UPDATE users SET status = 'approved' WHERE status IS NULL;`,
    ];

    for (const stmt of alterColumns) {
      try {
        await db.execute(sql.raw(stmt));
      } catch (err: any) {
        // Ignore 42701 (duplicate column) notices
        if (err?.code !== '42701') {
          console.warn(`[DB-Init] Column sync statement notice: ${err?.message || err}`);
        }
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
    `);

    console.log('[DB-Init] Database tables and schema verified successfully.');

    // 4. Seed initial admin and demo data if users table is empty
    const userCountRes = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    if ((userCountRes[0]?.count || 0) === 0) {
      console.log('[DB-Init] Database is empty. Seeding admin user and default courses...');
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
