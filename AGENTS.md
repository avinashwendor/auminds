# AGENTS.md — Course Content Delivery Playbook

When the user asks to **deliver, seed, migrate, or enrich course content**, follow this workflow exactly.

## Golden Rule

**Drizzle schema ≠ live database.** Changing `lib/db/schema.ts` does not update Postgres. Always run schema sync (`npm run db:push` or `scripts/init-db.ts`) **and** content delivery (`npm run db:deliver-course`) after curriculum changes.

---

## Course Content Architecture

```
content/<course-slug>/          ← Source files (markdown + lab code) — authoring only
lib/db/course-content/          ← TypeScript curriculum definitions
lib/course-content-blob.ts      ← S3 upload/fetch helpers (deterministic keys)
lib/course-content-hydrate.ts   ← Resolves blob URLs → content at read time
lib/db/persist-content.ts       ← Upload + DB pointer logic
scripts/deliver-course-content.ts ← Idempotent DB + blob migration script
```

### Storage model (Postgres + S3)

| Layer | Stores |
|-------|--------|
| **S3 blob** | Markdown lectures, code labs, quiz question JSON, assignment instructions |
| **Postgres** | Course structure, metadata, blob URLs, student progress |

When S3 is configured, `npm run db:deliver-course` uploads all body content to blob storage and saves **URLs only** in the database. The app hydrates content at read time (server-side) so the student UI always receives full text.

**Blob key layout:**
```
courses/<course-slug>/lessons/<lessonId>/content.md
courses/<course-slug>/lessons/<lessonId>/initial.js
courses/<course-slug>/lessons/<lessonId>/solution.js
courses/<course-slug>/quizzes/<quizId>/questions.json
courses/<course-slug>/assignments/<assignmentId>/instructions.md
```

If S3 is not configured, the system falls back to inline Postgres text (backward compatible).

### Required S3 environment variables

```bash
S3_ENDPOINT=https://t3.storageapi.dev
S3_BUCKET=your-bucket
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_URL=https://t3.storageapi.dev/your-bucket
```

Admin lesson creation (`POST /api/admin/courses` action `createLesson`) automatically uploads content to blob when S3 is configured.

### Content folder structure (per course)

```
content/intro-to-backend-systems/
├── module-01-recording.md        # Markdown lecture
├── module-01-js-basics.md
├── module-02-node-notes.md
└── labs/
    ├── arrow-functions.initial.js
    ├── arrow-functions.solution.js
    └── ...
```

### Curriculum definition

Each course has a definition in `lib/db/course-content/<course>.ts` that:

1. Reads markdown/lab files from `content/<slug>/`
2. Declares **stable lesson IDs** (never use `Date.now()` for delivery content)
3. Maps to **existing DB IDs** when migrating live courses (`EXISTING_LESSON_IDS`)
4. Attaches **quizzes and assignments to specific lessons** (required for student UI)

Register new courses in `lib/db/course-content/index.ts`.

---

## Student UX Requirements (Non-Negotiable)

The course workspace loads quizzes and assignments **per active lesson** via `getQuizForLesson` / `getAssignmentForLesson`. Every quiz and assignment **must** have a `lessonId`.

### Recommended lesson flow per module

```
1. Markdown concept lecture
2. Monaco code lab (interactive)
3. Quiz (lesson-linked, 3–5 MCQs)
4. Optional: Assignment (GitHub repo submission)
```

### Lesson types

| Type | Use for |
|------|---------|
| `markdown` | Lecture notes, class recordings (with external links) |
| `code` | Monaco IDE labs with `initialCode` + `solutionCode` |
| `video` | Protected video URLs |

### Quiz best practices

- Attach to the **last lesson** in a module (usually after a code lab)
- Set `passingScore: 70`, `maxAttempts: 3`, optional `timeLimitMinutes`
- Include `explanation` on every question for review screen
- Use stable quiz IDs like `quiz-class1-js-fundamentals`

### Code lab best practices

- Start with a clear task comment block in `initialCode`
- Provide working `solutionCode` for the "Show Solution" button
- Use `console.log(JSON.stringify(...))` for verifiable output
- Pair labs with assignments when students should submit external work

---

## Delivery Checklist

When asked to deliver course content, execute in order:

### 1. Fetch existing content

```bash
# Inspect what's already in the database
DATABASE_URL="..." npx tsx -e "
  import postgres from 'postgres';
  // query courses, modules, lessons, quizzes
"
```

Preserve existing lesson IDs when enriching live courses. Never delete student progress data.

### 2. Author content files

- Export or write markdown to `content/<slug>/`
- Create lab `.initial.js` and `.solution.js` pairs in `content/<slug>/labs/`
- Define quizzes inline in the curriculum TS file (questions array)

### 3. Update curriculum definition

Edit `lib/db/course-content/<course>.ts`:

- Fix `orderIndex` on all lessons (no duplicates)
- Link quizzes to `lessonId` (not `courseId` alone)
- Add assignments on code labs where repo submission is expected

### 4. Run schema sync (if columns/tables changed)

```bash
DATABASE_URL="..." npm run db:push
# or
DATABASE_URL="..." npx tsx scripts/init-db.ts
```

### 5. Deliver content to database + blob storage

```bash
# Ensure S3 vars are set, then:
DATABASE_URL="..." npm run db:deliver-course
```

The deliver script uploads body content to S3 and stores URLs in Postgres. Re-running is safe (overwrites blob objects at deterministic keys).

### 6. Verify in database

Confirm:
- [ ] All modules have correct `orderIndex`
- [ ] Lessons progress: recording → notes → lab → quiz
- [ ] Every quiz has questions (`quiz_questions` rows)
- [ ] Quizzes have `lesson_id` set (not just `course_id`)
- [ ] Assignments linked to code lessons

---

## Adding a New Course

1. Create `content/<new-slug>/` with markdown and lab files
2. Create `lib/db/course-content/<new-slug>.ts` with full curriculum
3. Register in `lib/db/course-content/index.ts`
4. Create the course shell in admin UI or via `createCourse()` in a seed script
5. Run `npm run db:deliver-course -- <new-slug>`

---

## Common Pitfalls

| Problem | Cause | Fix |
|---------|-------|-----|
| `column "description" does not exist` | Schema drift | `npm run db:push` or add column in `init-db.ts` |
| Quiz tab missing in student UI | Quiz has `courseId` only | Set `lessonId` on the quiz |
| Lessons out of order | Duplicate `orderIndex` | Set sequential 1, 2, 3… per module |
| Empty quiz | Questions not seeded | Run deliver script; check `quiz_questions` table |
| Re-seed creates duplicates | Using `Date.now()` IDs | Use stable IDs in curriculum definition |

---

## Environment

```bash
DATABASE_URL=postgresql://user:pass@host:port/railway
DATABASE_SSL=true   # Required for Railway proxy connections from local

# S3 blob storage (required for course content delivery)
S3_ENDPOINT=https://t3.storageapi.dev
S3_BUCKET=your-bucket
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_URL=https://t3.storageapi.dev/your-bucket
S3_REGION=auto
```

---

## Quick Reference

```bash
npm run db:push              # Sync Drizzle schema → Postgres
npm run db:seed              # Seed demo users + sample courses (seed-data.ts)
npm run db:deliver-course    # Migrate curriculum content (idempotent)
npx tsx scripts/seed-class1.ts  # Legacy standalone Class 1 seeder (prefer deliver-course)
```
