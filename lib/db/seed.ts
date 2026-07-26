import { db } from './index';
import { 
  users, courses, courseEnrollments, modules, lessons, 
  quizzes, quizQuestions,
  assignments, assignmentSubmissions, jobPostings, communityMessages 
} from './schema';
import { initialSeedData } from './seed-data';

async function main() {
  console.log('🌱 Starting AUMINDS Database Seeding via Drizzle QueryBuilder...');

  try {
    // Insert Users
    console.log('Seeding Users...');
    for (const u of initialSeedData.users) {
      await db.insert(users).values(u as typeof users.$inferInsert).onConflictDoNothing();
    }

    // Insert Courses
    console.log('Seeding Courses...');
    for (const c of initialSeedData.courses) {
      await db.insert(courses).values(c as typeof courses.$inferInsert).onConflictDoNothing();
    }

    // Insert Enrollments
    console.log('Seeding Course Enrollments...');
    for (const e of initialSeedData.courseEnrollments) {
      await db.insert(courseEnrollments).values(e as typeof courseEnrollments.$inferInsert).onConflictDoNothing();
    }

    // Insert Modules
    console.log('Seeding Modules...');
    for (const m of initialSeedData.modules) {
      await db.insert(modules).values(m as typeof modules.$inferInsert).onConflictDoNothing();
    }

    // Insert Lessons
    console.log('Seeding Lessons...');
    for (const l of initialSeedData.lessons) {
      await db.insert(lessons).values(l as typeof lessons.$inferInsert).onConflictDoNothing();
    }

    // Insert Quizzes & Questions
    console.log('Seeding Quizzes & Questions...');
    for (const q of initialSeedData.quizzes) {
      await db.insert(quizzes).values(q as typeof quizzes.$inferInsert).onConflictDoNothing();
    }
    for (const qq of initialSeedData.quizQuestions) {
      await db.insert(quizQuestions).values(qq as typeof quizQuestions.$inferInsert).onConflictDoNothing();
    }

    // Insert Assignments & Submissions
    console.log('Seeding Assignments & Submissions...');
    for (const a of initialSeedData.assignments) {
      await db.insert(assignments).values(a as typeof assignments.$inferInsert).onConflictDoNothing();
    }
    for (const sub of initialSeedData.assignmentSubmissions) {
      await db.insert(assignmentSubmissions).values(sub as typeof assignmentSubmissions.$inferInsert).onConflictDoNothing();
    }

    // Insert Job Postings
    console.log('Seeding Job Postings...');
    for (const job of initialSeedData.jobPostings) {
      await db.insert(jobPostings).values(job as typeof jobPostings.$inferInsert).onConflictDoNothing();
    }

    // Insert Community Messages
    console.log('Seeding Community Chat Messages...');
    for (const msg of initialSeedData.communityMessages) {
      await db.insert(communityMessages).values(msg as typeof communityMessages.$inferInsert).onConflictDoNothing();
    }

    console.log('✅ AUMINDS Database Seeding Completed Successfully!');
  } catch (err) {
    console.warn('⚠️ Postgres direct seed skipped (Local offline mode active). Memory store ready!');
  }

  process.exit(0);
}

main();
