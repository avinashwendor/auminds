const courses = ['Web Dev', 'Data Science', 'Mobile Dev'];

function labChallenge() {
  const greetUser = (name) => `Hello, ${name}!`;
  const upperCourses = courses.map((course) => course.toUpperCase());
  return {
    greeting: greetUser('Alex'),
    upperCourses,
  };
}

console.log(JSON.stringify(labChallenge()));
