const students = [
  { id: 1, name: 'Alice', course: 'Web Dev' },
  { id: 2, name: 'Bob', course: 'Data Science' },
  { id: 3, name: 'Charlie', course: 'Web Dev' },
];

function handleGetStudents(req) {
  if (req.query?.course) {
    return students.filter(
      (s) => s.course.toLowerCase() === req.query.course.toLowerCase(),
    );
  }
  return students;
}

console.log('All:', JSON.stringify(handleGetStudents({ query: {} })));
console.log('Web Dev:', JSON.stringify(handleGetStudents({ query: { course: 'Web Dev' } })));
