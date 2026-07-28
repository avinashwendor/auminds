import { isDatabaseAvailable, db } from '../lib/db';
import { initialSeedData } from '../lib/db/seed-data';
import { users } from '../lib/db/schema';
import { sql } from 'drizzle-orm';

export async function ensureSchema() {
  console.log('[DB-Init] Checking database connection and schema...');
  const available = await isDatabaseAvailable({ force: true });
  if (!available) {
    console.warn('[DB-Init] Database is not available. Skipping schema synchronization.');
    return;
  }

  try {
    // Add missing columns to users table safely if they do not exist on production DB
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved',
      ADD COLUMN IF NOT EXISTS status_note text,
      ADD COLUMN IF NOT EXISTS signup_goal text,
      ADD COLUMN IF NOT EXISTS reviewed_at timestamp,
      ADD COLUMN IF NOT EXISTS reviewed_by text;
    `);

    // Ensure status is initialized
    await db.execute(sql`
      UPDATE users SET status = 'approved' WHERE status IS NULL;
    `);

    console.log('[DB-Init] Users table schema synchronized successfully.');

    // Check if initial admin user exists
    const userCountRes = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    if ((userCountRes[0]?.count || 0) === 0) {
      console.log('[DB-Init] Seeding initial admin and sample data...');
      for (const u of initialSeedData.users) {
        await db.insert(users).values(u as any).onConflictDoNothing();
      }
      console.log('[DB-Init] Seeding finished.');
    }
  } catch (err) {
    console.error('[DB-Init] Error synchronizing database schema:', err);
  }
}

if (require.main === module) {
  ensureSchema()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(0); // Exit 0 so startup is never blocked
    });
}
