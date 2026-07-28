import fs from 'fs';
import path from 'path';
import type { CourseContentDef } from './types';

const CONTENT_ROOT = path.join(process.cwd(), 'content/intro-to-backend-systems');

function readContent(fileName: string) {
  return fs.readFileSync(path.join(CONTENT_ROOT, fileName), 'utf8');
}

function readLab(baseName: string) {
  return {
    initialCode: readContent(`labs/${baseName}.initial.js`),
    solutionCode: readContent(`labs/${baseName}.solution.js`),
  };
}

/** Stable IDs for existing lessons already in production DB */
export const EXISTING_LESSON_IDS = {
  recording: 'lesson-1785236270519',
  jsNotes: 'lesson-1785236332166',
  nodeNotes: 'lesson-1785236376196',
} as const;

export const EXISTING_MODULE_IDS = {
  jsModule: 'mod-1785236087855',
  nodeModule: 'mod-1785236355555',
} as const;

export const introToBackendSystems: CourseContentDef = {
  slug: 'intro-to-backend-systems-',
  modules: [
    {
      id: EXISTING_MODULE_IDS.jsModule,
      title: 'Module 1: JavaScript Fundamentals for Web & Backend',
      orderIndex: 1,
      lessons: [
        {
          id: EXISTING_LESSON_IDS.recording,
          title: 'Class Recording — Watch Before You Start',
          type: 'markdown',
          orderIndex: 1,
          durationMinutes: 10,
          points: 10,
          markdownContent: readContent('module-01-recording.md'),
        },
        {
          id: EXISTING_LESSON_IDS.jsNotes,
          title: 'JS Basics — Variables, Functions, Arrays & Async',
          type: 'markdown',
          orderIndex: 2,
          durationMinutes: 30,
          points: 25,
          markdownContent: readContent('module-01-js-basics.md'),
        },
        {
          id: 'lesson-class1-arrow-lab',
          title: 'Monaco Lab: Arrow Functions & Array Transformations',
          type: 'code',
          orderIndex: 3,
          durationMinutes: 20,
          points: 30,
          language: 'javascript',
          ...readLab('arrow-functions'),
          assignment: {
            id: 'ass-class1-arrow-lab',
            title: 'Submit Your Arrow Functions Lab',
            maxPoints: 50,
            instructions: `### Assignment: Arrow Functions Practice

1. Fork or create a public GitHub repository.
2. Add a \`arrow-functions.js\` file with your completed lab solution.
3. Ensure \`greetUser\` uses arrow syntax and \`.map()\` returns uppercase course titles.
4. Submit your GitHub repo URL below for instructor review.`,
          },
        },
        {
          id: 'lesson-class1-async-lab',
          title: 'Monaco Lab: Async/Await & Promises',
          type: 'code',
          orderIndex: 4,
          durationMinutes: 20,
          points: 30,
          language: 'javascript',
          ...readLab('async-await'),
          quiz: {
            id: 'quiz-class1-js-fundamentals',
            title: 'Module 1 Quiz: JavaScript Fundamentals',
            description: 'Test your understanding of let/const, arrow functions, array methods, async/await, and HTTP clients.',
            passingScore: 70,
            points: 25,
            timeLimitMinutes: 15,
            maxAttempts: 3,
            shuffleQuestions: true,
            questions: [
              {
                question: 'Which variable keyword should be used by default for values that will NOT be reassigned?',
                options: ['var', 'let', 'const', 'static'],
                correctOptionIndex: 2,
                explanation: 'const should be used by default for immutable variable references.',
              },
              {
                question: 'What is the result of calling [1, 2, 3].map(x => x * 2)?',
                options: ['[1, 2, 3]', '[2, 4, 6]', '6', 'undefined'],
                correctOptionIndex: 1,
                explanation: '.map() transforms every element and returns a new array [2, 4, 6].',
              },
              {
                question: 'Which of the following is a primitive data type in JavaScript?',
                options: ['Array', 'Object', 'Boolean', 'Function'],
                correctOptionIndex: 2,
                explanation: 'Boolean is a primitive type. Arrays, Objects, and Functions are reference types.',
              },
              {
                question: 'How does Axios differ from built-in fetch regarding JSON data parsing?',
                options: [
                  'Axios requires calling res.json()',
                  'Axios automatically parses JSON into response.data',
                  'Fetch automatically parses JSON into response.data',
                  'Neither supports JSON',
                ],
                correctOptionIndex: 1,
                explanation: 'Axios automatically parses JSON payloads into response.data.',
              },
              {
                question: 'Why is async/await preferred over chained .then() promises?',
                options: [
                  'It makes asynchronous code read synchronously line-by-line',
                  'It makes code run 10x faster',
                  'It disables error handling',
                  'It removes the need for HTTP servers',
                ],
                correctOptionIndex: 0,
                explanation: 'async/await simplifies control flow so code reads top-to-bottom.',
              },
            ],
          },
        },
      ],
    },
    {
      id: EXISTING_MODULE_IDS.nodeModule,
      title: 'Module 2: Web Backend & Node.js Basics',
      orderIndex: 2,
      lessons: [
        {
          id: EXISTING_LESSON_IDS.nodeNotes,
          title: 'Node.js & Express — Architecture, Routing & Postman',
          type: 'markdown',
          orderIndex: 1,
          durationMinutes: 35,
          points: 25,
          markdownContent: readContent('module-02-node-notes.md'),
        },
        {
          id: 'lesson-class1-express-lab',
          title: 'Monaco Lab: Building a Hello World Express Route',
          type: 'code',
          orderIndex: 2,
          durationMinutes: 20,
          points: 30,
          language: 'javascript',
          ...readLab('express-hello'),
          quiz: {
            id: 'quiz-class1-backend-architecture',
            title: 'Quiz: Backend Architecture & Database Security',
            description: 'Test your knowledge on frontend vs backend separation and QueryBuilder security rules.',
            passingScore: 70,
            points: 25,
            maxAttempts: 3,
            questions: [
              {
                question: 'Why should frontends NEVER connect directly to production database servers?',
                options: [
                  'Browsers do not support databases',
                  'Direct connection exposes database passwords and allows unauthorized data deletion',
                  'Database connections slow down browser rendering',
                  'HTTP does not support SQL',
                ],
                correctOptionIndex: 1,
                explanation: 'Direct browser database access exposes credentials and bypasses authorization.',
              },
              {
                question: 'What is the mandatory security rule when executing database queries in backend applications?',
                options: [
                  'Always concatenate SQL strings directly',
                  'Always use a QueryBuilder to prevent SQL injection attacks',
                  'Store database passwords in client local storage',
                  'Disable database authentication',
                ],
                correctOptionIndex: 1,
                explanation: 'QueryBuilders sanitize parameters and prevent SQL injection vulnerabilities.',
              },
              {
                question: 'What is the role of the backend server in a web application?',
                options: [
                  'Render HTML and CSS in the browser',
                  'Handle business logic, security gatekeeping, and database access',
                  'Store user passwords in localStorage',
                  'Replace the need for a database',
                ],
                correctOptionIndex: 1,
                explanation: 'The backend is the gatekeeper between clients and persistent data stores.',
              },
            ],
          },
        },
        {
          id: 'lesson-class1-routing-lab',
          title: 'Monaco Lab: Filtering Data with req.query',
          type: 'code',
          orderIndex: 3,
          durationMinutes: 25,
          points: 35,
          language: 'javascript',
          ...readLab('routing-filter'),
          quiz: {
            id: 'quiz-class1-express-routing',
            title: 'Quiz: Express Routing & Input Handling',
            description: 'Verify your mastery of req.params, req.query, req.body, and req.headers.',
            passingScore: 70,
            points: 25,
            timeLimitMinutes: 10,
            maxAttempts: 3,
            shuffleQuestions: true,
            questions: [
              {
                question: 'Which property extracts parameters defined in the URL route path (e.g. /users/:id)?',
                options: ['req.body', 'req.params', 'req.query', 'req.headers'],
                correctOptionIndex: 1,
                explanation: 'req.params contains path parameters specified with colons in route paths.',
              },
              {
                question: 'Where do query parameters appear in a request URL (e.g. /search?category=books)?',
                options: [
                  'After the question mark (?) in key-value pairs',
                  'Inside the HTTP request body',
                  'Inside authorization headers',
                  'In the server package.json',
                ],
                correctOptionIndex: 0,
                explanation: 'Query parameters follow the ? in the URL path.',
              },
              {
                question: 'Which middleware is required before reading JSON from req.body in Express?',
                options: [
                  'app.use(express.json())',
                  'app.use(express.static())',
                  'app.use(cors())',
                  'No middleware is needed',
                ],
                correctOptionIndex: 0,
                explanation: 'express.json() parses incoming JSON request bodies.',
              },
              {
                question: 'Which HTTP method is typically used to CREATE a new resource?',
                options: ['GET', 'POST', 'DELETE', 'OPTIONS'],
                correctOptionIndex: 1,
                explanation: 'POST is the standard method for creating new resources.',
              },
            ],
          },
          assignment: {
            id: 'ass-class1-routing-lab',
            title: 'Build a Student API with Express Routes',
            maxPoints: 100,
            instructions: `### Assignment: Student Portal API

Build a small Express API and submit your GitHub repository URL.

**Requirements:**
1. \`GET /\` — returns a welcome message
2. \`GET /api/students\` — returns all students; supports \`?course=\` query filter
3. \`GET /api/students/:id\` — returns a single student or 404
4. Include a \`README.md\` with Postman test screenshots or curl examples

**Bonus:** Add \`POST /api/students\` with \`express.json()\` middleware.

Submit your repo URL and optional live deployment link below.`,
          },
        },
      ],
    },
  ],
};
