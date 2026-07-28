// Lab: Arrow Functions & Array Transformations
// ─────────────────────────────────────────────
// 1. Create an arrow function `greetUser` that accepts a `name` and returns "Hello, <name>!"
// 2. Use .map() to transform every course title to UPPERCASE
// 3. Return an object with `greeting` and `upperCourses`

const courses = ['Web Dev', 'Data Science', 'Mobile Dev'];

function labChallenge() {
  const greetUser = (name) => {
    // TODO: return greeting
  };

  const upperCourses = courses.map((course) => {
    // TODO: return uppercase title
  });

  return {
    greeting: greetUser('Alex'),
    upperCourses,
  };
}

console.log(JSON.stringify(labChallenge()));
