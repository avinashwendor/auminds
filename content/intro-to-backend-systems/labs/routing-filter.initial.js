// Lab: Filtering with req.query
// ───────────────────────────────
// Complete handleGetStudents so it:
// - Returns all students when req.query is empty
// - Filters by course name (case-insensitive) when req.query.course is set

const students = [
  { id: 1, name: 'Alice', course: 'Web Dev' },
  { id: 2, name: 'Bob', course: 'Data Science' },
  { id: 3, name: 'Charlie', course: 'Web Dev' },
];

function handleGetStudents(req) {
  // TODO: implement filtering logic
}

console.log('All:', JSON.stringify(handleGetStudents({ query: {} })));
console.log('Web Dev:', JSON.stringify(handleGetStudents({ query: { course: 'Web Dev' } })));
