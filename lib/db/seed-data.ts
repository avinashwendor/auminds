import bcrypt from 'bcryptjs';

// Pre-hashed default password for initial seed: 'admin123' and 'student123'
const defaultHashedPassword = bcrypt.hashSync('admin123', 10);
const defaultStudentPassword = bcrypt.hashSync('student123', 10);

export const initialSeedData = {
  users: [
    {
      id: 'user-admin-1',
      username: 'admin',
      passwordHash: defaultHashedPassword,
      name: 'Admin Director',
      role: 'admin',
      status: 'approved',
      email: 'admin@auminds.academy',
      points: 500,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
      createdAt: new Date(),
    },
    {
      id: 'user-student-1',
      username: 'alex_coder',
      passwordHash: defaultStudentPassword,
      name: 'Alex Rivera',
      role: 'student',
      status: 'approved',
      email: 'alex@auminds.academy',
      points: 380,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=alex',
      createdAt: new Date(),
    },
    {
      id: 'user-student-2',
      username: 'sarah_dev',
      passwordHash: defaultStudentPassword,
      name: 'Sarah Chen',
      role: 'student',
      status: 'approved',
      email: 'sarah@auminds.academy',
      points: 450,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=sarah',
      createdAt: new Date(),
    },
    {
      id: 'user-student-3',
      username: 'sam_hacker',
      passwordHash: defaultStudentPassword,
      name: 'Sam Wilson',
      role: 'student',
      status: 'approved',
      email: 'sam@auminds.academy',
      points: 210,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=sam',
      createdAt: new Date(),
    },
    {
      id: 'user-student-4',
      username: 'priya_waiting',
      passwordHash: defaultStudentPassword,
      name: 'Priya Nair',
      role: 'student',
      status: 'pending',
      email: 'priya@example.com',
      signupGoal: 'Switch from QA into full-stack engineering.',
      points: 0,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=priya',
      createdAt: new Date(),
    },
  ],

  courses: [
    {
      id: 'course-1',
      title: 'Full-Stack Next.js 14 & Modern Web Architecture',
      slug: 'fullstack-nextjs',
      description: 'Master production Next.js 14, App Router, React Server Components, Drizzle ORM, PostgreSQL, and high-performance UI engineering.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
      level: 'Intermediate',
      isPublished: true,
      createdAt: new Date(),
    },
    {
      id: 'course-2',
      title: 'Data Structures & Algorithms in TypeScript',
      slug: 'dsa-typescript',
      description: 'Conquer FAANG technical interviews with hands-on algorithm visualization, Monaco code challenges, dynamic programming, and graphs.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516116211223-425826889759?q=80&w=800&auto=format&fit=crop',
      level: 'Advanced',
      isPublished: true,
      createdAt: new Date(),
    },
    {
      id: 'course-3',
      title: 'PostgreSQL Database Engineering & Query Building',
      slug: 'backend-databases',
      description: 'Deep dive into database indexing, QueryBuilder patterns, schema migrations, caching, and Railway serverless deployment.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=800&auto=format&fit=crop',
      level: 'Beginner',
      isPublished: true,
      createdAt: new Date(),
    },
  ],

  courseEnrollments: [
    { id: 'e1', userId: 'user-student-1', courseId: 'course-1', enrolledAt: new Date() },
    { id: 'e2', userId: 'user-student-1', courseId: 'course-2', enrolledAt: new Date() },
    { id: 'e3', userId: 'user-student-2', courseId: 'course-1', enrolledAt: new Date() },
    { id: 'e4', userId: 'user-student-2', courseId: 'course-3', enrolledAt: new Date() },
    { id: 'e5', userId: 'user-student-3', courseId: 'course-1', enrolledAt: new Date() },
  ],

  modules: [
    // Course 1 Modules
    { id: 'mod-1', courseId: 'course-1', title: 'Module 1: Foundations of Next.js App Router', orderIndex: 1 },
    { id: 'mod-2', courseId: 'course-1', title: 'Module 2: Server Actions & QueryBuilder Backend', orderIndex: 2 },
    { id: 'mod-3', courseId: 'course-1', title: 'Module 3: In-House Code Editor & Monaco Integration', orderIndex: 3 },
    
    // Course 2 Modules
    { id: 'mod-4', courseId: 'course-2', title: 'Module 1: Arrays, HashMaps & Two Pointers', orderIndex: 1 },
  ],

  lessons: [
    // Lessons for Module 1
    {
      id: 'lesson-1',
      moduleId: 'mod-1',
      title: '1.1 Introduction to Next.js App Router & Architecture',
      type: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=wm5gMKCORL4',
      markdownContent: null,
      initialCode: null,
      solutionCode: null,
      language: null,
      orderIndex: 1,
      durationMinutes: 15,
      points: 20,
    },
    {
      id: 'lesson-2',
      moduleId: 'mod-1',
      title: '1.2 High-Performance Styling with CSS Variables & Glassmorphism',
      type: 'markdown',
      videoUrl: null,
      markdownContent: `# Architectural Design Systems in Modern Web Apps

Welcome to AUMINDS Advanced Design Lecture! In this module, we explore how modern web applications build scalable visual identity using **Design Tokens** and **CSS Custom Properties**.

## Core Pillars of Modern UX

1. **Design Consistency**: Standardized spacing scales, typography hierarchies, and color palettes.
2. **Glassmorphism & Micro-animations**: Subtle transparency (\`backdrop-filter: blur(12px)\`) combined with 60fps transitions.
3. **Accessibility (a11y)**: High contrast ratios, accessible focus indicators, and semantic HTML5 structures.

\`\`\`css
/* Glassmorphic Panel Token */
.glass-panel {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  border-radius: 1rem;
}
\`\`\`

### Key Takeaway
Never hardcode raw hex values across component trees. Always bind UI themes to structured design tokens to ensure maintainable, high-impact user experiences.
`,
      initialCode: null,
      solutionCode: null,
      language: null,
      orderIndex: 2,
      durationMinutes: 12,
      points: 15,
    },
    {
      id: 'lesson-3',
      moduleId: 'mod-1',
      title: '1.3 Hands-on Coding: Two-Sum Algorithm Exercise',
      type: 'code',
      videoUrl: null,
      markdownContent: null,
      initialCode: `// Problem: Given an array of integers 'nums' and an integer 'target',
// return indices of the two numbers such that they add up to target.

function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

// Test Execution
console.log("Testing twoSum([2, 7, 11, 15], 9):");
console.log(twoSum([2, 7, 11, 15], 9));
`,
      solutionCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      language: 'javascript',
      orderIndex: 3,
      durationMinutes: 20,
      points: 25,
    },

    // Lesson for Module 2
    {
      id: 'lesson-4',
      moduleId: 'mod-2',
      title: '2.1 QueryBuilder & Safe Database Layer in Next.js',
      type: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=9g0H2gK1r40',
      markdownContent: null,
      initialCode: null,
      solutionCode: null,
      language: null,
      orderIndex: 1,
      durationMinutes: 18,
      points: 20,
    },
  ],

  lessonCompletions: [
    { id: 'lc-1', userId: 'user-student-1', lessonId: 'lesson-1', completedAt: new Date() },
    { id: 'lc-2', userId: 'user-student-1', lessonId: 'lesson-2', completedAt: new Date() },
  ],

  quizzes: [
    {
      id: 'quiz-1',
      lessonId: 'lesson-1',
      courseId: 'course-1',
      title: 'Module 1 Architecture & App Router Knowledge Check',
      passingScore: 70,
      points: 30,
    },
  ],

  quizQuestions: [
    {
      id: 'qq-1',
      quizId: 'quiz-1',
      question: 'In Next.js App Router, which directory file renders the primary page view for a route segment?',
      options: ['route.ts', 'layout.tsx', 'page.tsx', 'template.tsx'],
      correctOptionIndex: 2,
      explanation: 'In the App Router, page.tsx defines the unique UI view rendered for a route path segment.',
    },
    {
      id: 'qq-2',
      quizId: 'quiz-1',
      question: 'Why should backend database queries always utilize a type-safe QueryBuilder instead of string concatenation?',
      options: [
        'To prevent SQL injection vulnerabilities and guarantee compile-time type safety',
        'Because raw strings execute faster on the client browser',
        'QueryBuilder disables database indexing automatically',
        'It is a aesthetic design rule only'
      ],
      correctOptionIndex: 0,
      explanation: 'QueryBuilder parameterizes inputs, shielding against SQL injections and catching query schema bugs at compile time.',
    },
    {
      id: 'qq-3',
      quizId: 'quiz-1',
      question: 'Which HTTP headers ensure secure session cookies cannot be read by third-party client JavaScript scripts?',
      options: ['Access-Control-Allow-Origin', 'HttpOnly; Secure; SameSite=Lax', 'Content-Type: application/json', 'Cache-Control: no-store'],
      correctOptionIndex: 1,
      explanation: 'HttpOnly prevents client-side document.cookie access, protecting session tokens from XSS vectors.',
    },
  ],

  quizAttempts: [
    {
      id: 'qa-1',
      userId: 'user-student-1',
      quizId: 'quiz-1',
      score: 100,
      passed: true,
      createdAt: new Date(),
    },
  ],

  assignments: [
    {
      id: 'ass-1',
      lessonId: 'lesson-3',
      courseId: 'course-1',
      title: 'Build a Full-Stack Coding Portal Component',
      instructions: `### Assignment Guidelines & Requirements

1. **Repository Setup**: Create a public GitHub repository with a Next.js App Router project.
2. **Feature Requirements**:
   - Implement an interactive Monaco Code Editor view.
   - Connect a backend API endpoint built with Drizzle QueryBuilder.
   - Include a live preview pane for rendering code output.
3. **Submission**: Submit your GitHub repository URL and live deployment link below for Admin review.`,
      maxPoints: 100,
    },
  ],

  assignmentSubmissions: [
    {
      id: 'sub-1',
      assignmentId: 'ass-1',
      userId: 'user-student-1',
      repoUrl: 'https://github.com/alexrivera/auminds-monaco-portal',
      demoUrl: 'https://monaco-portal-demo.railway.app',
      notes: 'Completed all core requirements with custom glassmorphism UI theme.',
      status: 'accepted' as const,
      pointsAwarded: 100,
      feedback: 'Outstanding work Alex! Flawless QueryBuilder backend integration and pristine code quality.',
      submittedAt: new Date(Date.now() - 86400000),
      reviewedAt: new Date(),
    },
    {
      id: 'sub-2',
      assignmentId: 'ass-1',
      userId: 'user-student-2',
      repoUrl: 'https://github.com/sarahchen/nextjs-code-runner',
      demoUrl: 'https://nextjs-runner.railway.app',
      notes: 'Implemented Monaco editor with JavaScript execution sandbox.',
      status: 'pending' as const,
      pointsAwarded: 0,
      feedback: null,
      submittedAt: new Date(Date.now() - 3600000),
      reviewedAt: null,
    },
  ],

  jobPostings: [
    {
      id: 'job-1',
      title: 'Junior Full-Stack Next.js Developer',
      company: 'Vercel Ecosystem Labs',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
      location: 'Remote (Worldwide)',
      type: 'Full-time',
      salary: '$95,000 - $125,000 / year',
      description: 'We are seeking an ambitious Next.js developer trained in App Router architecture, Drizzle QueryBuilder, and clean UI engineering. You will collaborate on core platform features.',
      applyUrl: 'https://careers.vercel.com',
      createdAt: new Date(Date.now() - 172800000),
    },
    {
      id: 'job-2',
      title: 'Frontend Engineering Intern (React & TypeScript)',
      company: 'Railway Deployment Platform',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
      location: 'San Francisco, CA / Remote',
      type: 'Internship',
      salary: '$45 - $55 / hour',
      description: 'Join the Railway UI engineering team! Build sleek developer tools, dashboard telemetry, and cloud infrastructure management interfaces.',
      applyUrl: 'https://railway.app/careers',
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      id: 'job-3',
      title: 'Database Systems & QueryBuilder Specialist',
      company: 'Supabase & Open Source Collective',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
      location: 'Remote (EST / PST)',
      type: 'Full-time',
      salary: '$120,000 - $150,000 / year',
      description: 'Optimize PostgreSQL query performance, build ORM connectors, and design low-latency database pooling solutions.',
      applyUrl: 'https://supabase.com/careers',
      createdAt: new Date(),
    },
  ],

  communityMessages: [
    {
      id: 'msg-1',
      userId: 'user-student-1',
      courseId: 'course-1',
      content: 'Hey everyone! Just finished Module 1. The Monaco editor integration exercise was super fun! Let me know if anyone needs tips on the Two-Sum logic.',
      createdAt: new Date(Date.now() - 7200000),
    },
    {
      id: 'msg-2',
      userId: 'user-student-2',
      courseId: 'course-1',
      content: 'Thanks Alex! Really enjoying the glassmorphism lecture notes. Modern CSS custom variables make styling so clean.',
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: 'msg-3',
      userId: 'user-admin-1',
      courseId: 'course-1',
      content: 'Great discussion team! Remember to check the Job Board section—new Next.js and Railway internship positions were posted today!',
      createdAt: new Date(Date.now() - 1800000),
    },
  ],
};
