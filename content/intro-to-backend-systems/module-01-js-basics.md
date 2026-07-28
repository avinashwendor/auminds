# Class 1: JavaScript Fundamentals for Web & Backend

A clean, beginner-friendly reference guide covering essential JavaScript concepts needed before diving into backend Node.js development.

---

## Table of Contents
1. [What is JavaScript?](#1-what-is-javascript)
2. [Variables & Scope (`let` vs `const`)](#2-variables--scope-let-vs-const)
3. [Data Types: Primitives vs Objects](#3-data-types-primitives-vs-objects)
4. [Functions & Arrow Syntax](#4-functions--arrow-syntax)
5. [Working with Objects & Arrays](#5-working-with-objects--arrays)
6. [Basic Asynchronous JavaScript (Callbacks & Async/Await)](#6-basic-asynchronous-javascript-callbacks--asyncawait)
7. [Making HTTP Requests: `fetch` vs `axios`](#7-making-http-requests-fetch-vs-axios)

---

## 1. What is JavaScript?

JavaScript is the programming language of the web. It was originally built to run inside browsers to make web pages interactive. 

Today, using **Node.js**, JavaScript can also run on servers to build complete backend systems and APIs.

---

## 2. Variables & Scope (`let` vs `const`)

In modern JavaScript, we declare variables using `let` and `const`. Avoid using the older `var`.

* **`const`**: Use by default for values that will **not** be reassigned.
* **`let`**: Use when you need to reassign a variable later.

```javascript
const serverPort = 3000; // Cannot be reassigned
let userCount = 10;     // Can be reassigned later

userCount = 11; // Valid
// serverPort = 4000; // Error! Assignment to constant variable.
```

---

## 3. Data Types: Primitives vs Objects

### Primitive Types (Simple Values)
* **String**: Text enclosed in quotes (`"hello"`, `'world'`).
* **Number**: Integers or decimals (`25`, `99.99`).
* **Boolean**: Logical values (`true` or `false`).
* **Undefined**: Variable declared but not assigned a value yet.
* **Null**: Intentionally empty value.

```javascript
const appName = "My Backend Server"; // String
const port = 3000;                  // Number
const isOnline = true;              // Boolean
let dbConnection = null;           // Null (empty)
```

### Reference Types (Objects & Arrays)
Objects and arrays store collections of values.

```javascript
// Object (Key-Value pairs)
const user = {
  id: 1,
  name: "Alice",
  role: "Student"
};

// Accessing object properties
console.log(user.name); // Output: "Alice"
```

---

## 4. Functions & Arrow Syntax

Functions are reusable blocks of code that take inputs (parameters) and return an output.

### Standard Function vs Arrow Function

```javascript
// 1. Standard Function Declaration
function greetUser(name) {
  return "Hello, " + name + "!";
}

// 2. Modern Arrow Function Syntax (Clean & Concise)
const greetUserArrow = (name) => {
  return `Hello, ${name}!`;
};

// Single-line arrow function (Implicit return)
const add = (a, b) => a + b;

console.log(greetUser("Bob"));   // "Hello, Bob!"
console.log(add(5, 10));        // 15
```

---

## 5. Working with Objects & Arrays

### Arrays (Lists of Items)
```javascript
const courses = ["Web Dev", "Data Science", "Mobile Dev"];

// Accessing items by zero-based index
console.log(courses[0]); // "Web Dev"

// Array method: .map() (Transforms every element)
const upperCourses = courses.map(course => course.toUpperCase());
console.log(upperCourses); // ["WEB DEV", "DATA SCIENCE", "MOBILE DEV"]

// Array method: .filter() (Filters elements matching a condition)
const webDevOnly = courses.filter(course => course.includes("Web"));
console.log(webDevOnly); // ["Web Dev"]
```

---

## 6. Basic Asynchronous JavaScript (Callbacks & Async/Await)

Backend operations (reading files, connecting to databases, calling external APIs) take time. JavaScript handles these without freezing your application using **Asynchronous Operations**.

### Promises & `async/await` Example

```javascript
// Simulating an asynchronous database fetch
function fetchUserData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: 1, name: "Alice" });
    }, 1000); // 1 second delay
  });
}

// Using async / await to write readable async code
async function getUser() {
  console.log("Fetching user from database...");
  const user = await fetchUserData(); // Waits for promise to resolve
  console.log("User received:", user.name);
}

getUser();
```

---

## 7. Making HTTP Requests: `fetch` vs `axios`

When a client (or Node backend) wants to request data from an external API, we use HTTP client tools. Two of the most popular methods in JavaScript are **`fetch`** and **`Axios`**.

---

### Option A: Using Built-in `fetch` API

`fetch` is built directly into modern browsers and Node.js (v18+). You do **not** need to install any package to use it.

#### 1. Simple GET Request with `fetch`
```javascript
async function getPostsWithFetch() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    
    // Check if the HTTP response status is OK (200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Step 2: Convert the raw response into JSON
    const data = await response.json();
    console.log("Fetch Data:", data);
  } catch (error) {
    console.error("Fetch Error:", error.message);
  }
}

getPostsWithFetch();
```

#### Key points of `fetch`:
* Built-in (no `npm install` needed).
* Requires two steps: `await fetch(...)` and then `await response.json()`.
* You must manually check `if (!response.ok)` for HTTP errors like 404 or 500.

---

### Option B: Using `Axios` Library

`Axios` is a popular third-party library. To use it in Node.js, you install it first:
```bash
npm install axios
```

#### 1. Simple GET Request with `Axios`
```javascript
const axios = require('axios'); // Import Axios in Node.js

async function getPostsWithAxios() {
  try {
    // Axios automatically parses JSON and returns it in response.data
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
    
    console.log("Axios Data:", response.data);
  } catch (error) {
    // Axios automatically catches 4xx and 5xx HTTP status errors
    console.error("Axios Error:", error.message);
  }
}

getPostsWithAxios();
```

#### 2. Simple POST Request with `Axios`
```javascript
async function createPostWithAxios() {
  try {
    const newPost = {
      title: 'Learning Backend',
      body: 'Node.js and Express basics',
      userId: 1
    };

    // Send POST request with JSON body
    const response = await axios.post('https://jsonplaceholder.typicode.com/posts', newPost);
    
    console.log("Created Post:", response.data);
  } catch (error) {
    console.error("Error creating post:", error.message);
  }
}

createPostWithAxios();
```

#### Key points of `Axios`:
* Automatic JSON parsing (`response.data` gives you the object directly).
* Automatically throws errors for HTTP error codes (like 404 or 500).
* Clean and concise syntax for GET and POST requests.

---

### Quick Comparison Table for Classroom

| Feature | `fetch` API | `Axios` Library |
| :--- | :--- | :--- |
| **Installation** | Built-in (No installation) | Requires `npm install axios` |
| **JSON Data Access** | Requires `await res.json()` | Automatic (`res.data`) |
| **Error Handling** | Must manually check `res.ok` | Automatically catches 4xx/5xx errors |
| **Data Payload** | Send as `body: JSON.stringify(data)` | Send directly as JavaScript object |

---

## Classroom Quick Summary
- [x] Use `const` by default, `let` when reassigning.
- [x] Use arrow functions `(param) => { ... }` for clean code.
- [x] Practice accessing Object keys (`user.name`) and Array methods (`.map()`, `.filter()`).
- [x] Use `async/await` for asynchronous operations.
- [x] Use `fetch` for quick built-in API requests; use `Axios` for simplified data access (`response.data`) and automatic error handling.
