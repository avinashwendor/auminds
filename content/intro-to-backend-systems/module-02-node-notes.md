# Class 1: Web Backend & Node.js Basics (Teaching Guide)

A step-by-step classroom reference guide covering pre-coding backend concepts, Node.js project initialization, basic routing, the 4 ways clients pass data (`req.params`, `req.query`, `req.body`, `req.headers`), writing simple GET endpoints, and testing APIs using Postman.

---

## Table of Contents
1. [Pre-Coding Concepts: Why Backend & Database?](#1-pre-coding-concepts-why-backend--database)
2. [Step-by-Step Node.js Project Setup & File Creation](#2-step-by-step-nodejs-project-setup--file-creation)
3. [Basics of Routing in Express](#3-basics-of-routing-in-express)
4. [The 4 Ways Clients Send Data to Backend Routes](#4-the-4-ways-clients-send-data-to-backend-routes)
5. [Writing Simple GET Endpoints (Hands-On Code)](#5-writing-simple-get-endpoints-hands-on-code)
6. [Testing Your GET Endpoints using Postman](#6-testing-your-get-endpoints-using-postman)

---

## 1. Pre-Coding Concepts: Why Backend & Database?

Before writing code, let's understand why we need a backend server in web development.

### What is the Frontend vs Backend?
* **Frontend (Client)**: Everything the user sees and clicks in the browser (HTML, CSS, JavaScript).
* **Backend (Server)**: The invisible engine running on a remote computer that handles logic, security, and database access.

```
┌──────────────────────┐                    ┌──────────────────────┐                    ┌──────────────────────┐
│       FRONTEND       │    HTTP Request    │       BACKEND        │   Database Query   │       DATABASE       │
│      (Browser)       ├───────────────────►│       (Server)       ├───────────────────►│    (PostgreSQL/SQL)  │
│  - User Interface    │                    │  - Business Logic    │                    │  - Permanent Data    │
│  - Form Inputs       │◄───────────────────┤  - Security / Auth   │◄───────────────────┤    Storage           │
└──────────────────────┘    HTTP Response   └──────────────────────┘   Query Results    └──────────────────────┘
```

### Why can't the Frontend connect directly to the Database?
1. **Security Secrets**: Databases require secret passwords and access keys. If the browser connects directly to a database, anyone can open DevTools and steal your database password.
2. **Data Safety**: A user could write code in their browser console to delete all database tables. The backend acts as a **gatekeeper** to verify what users are allowed to do.
3. **What is a Database & How does Backend Connect to it?**
   * A database is a structured storage system (like PostgreSQL or MySQL) that keeps data saved even when servers restart.
   * The backend connects to the database using safe drivers and **QueryBuilders** (like Knex.js).

> [!IMPORTANT]
> **Database Rule**: Always use a **QueryBuilder** in your backend code to query databases safely. Never write raw SQL string concatenations, as they allow dangerous SQL injection attacks.

---

## 2. Step-by-Step Node.js Project Setup & File Creation

Here is how we set up a Node.js backend application from scratch.

### Step 1: Open Terminal & Create a Project Folder
```bash
# Create a new directory for your project
mkdir my-backend-app

# Move into the folder
cd my-backend-app
```

### Step 2: Initialize Node.js Project (`package.json`)
Run `npm init -y` to generate a `package.json` file. This file tracks your project settings and installed packages.
```bash
npm init -y
```

### Step 3: Install Express
**Express** is a popular, simple framework for Node.js that makes building backend web servers easy.
```bash
npm install express
```

### Step 4: Create the Main Server File (`index.js`)
Create a file named `index.js` in your project folder.

### Step 5: Run Your Node Application
To start your backend server, run this command in terminal:
```bash
node index.js
```

---

## 3. Basics of Routing in Express

### What is a Route?
A **Route** is a combination of:
1. **An HTTP Method** (e.g., `GET` to read data, `POST` to create data).
2. **A Path / URL** (e.g., `/`, `/about`, `/users`).
3. **A Handler Function** (The code that runs when someone visits that URL).

### Creating Your First Hello World Server (`index.js`)

```javascript
// Step 1: Import Express
const express = require('express');

// Step 2: Create an Express App instance
const app = express();

// Step 3: Define a basic GET route at the root path '/'
app.get('/', (req, res) => {
  // req = Request (Data coming from client)
  // res = Response (Data we send back to client)
  res.send('Hello World! Welcome to Node.js Backend.');
});

// Step 4: Listen on a port (e.g. 3000)
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

---

## 4. The 4 Ways Clients Send Data to Backend Routes

When a client communicates with a backend route, it can pass data in **4 main ways**:

```
                              ┌───────────────────────────────┐
                              │  4 Ways Data Arrives at Route │
                              └───────────────┬───────────────┘
                                              │
         ┌───────────────────┬────────────────┴───────────────────┬───────────────────┐
         ▼                   ▼                                    ▼                   ▼
  ┌──────────────┐    ┌──────────────┐                     ┌──────────────┐    ┌──────────────┐
  │ 1. req.params│    │ 2. req.query │                     │ 3. req.body  │    │ 4.req.headers│
  └──────────────┘    └──────────────┘                     └──────────────┘    └──────────────┘
```

---

### 1. `req.params` (URL Path Resource ID)
* **What it is**: Variables defined directly inside the URL path (e.g. `/users/:id`).
* **When to use**: To target a **specific single resource** (like a user by ID or product by ID).
* **Example URL**: `http://localhost:3000/users/5`

```javascript
// Route definition with parameter placeholder ':id'
app.get('/users/:id', (req, res) => {
  const userId = req.params.id; // Extracts "5"
  res.send(`Fetching details for User ID: ${userId}`);
});
```

---

### 2. `req.query` (Filtering / Searching / Sorting)
* **What it is**: Key-value pairs after the `?` in the URL (e.g. `/search?name=john&category=books`).
* **When to use**: For **filtering lists, sorting, or searching**.
* **Example URL**: `http://localhost:3000/products?category=electronics`

```javascript
app.get('/products', (req, res) => {
  const category = req.query.category; // Extracts "electronics"
  res.send(`Showing products in category: ${category}`);
});
```

---

### 3. `req.body` (JSON Payload for Creating/Updating)
* **What it is**: Data sent inside the hidden body of the request (usually formatted as JSON).
* **When to use**: Sending larger or sensitive data (like creating a new user profile).
* **Note**: Requires `app.use(express.json())` middleware at the top of your server file!

```javascript
// Middleware to read JSON body
app.use(express.json());

app.post('/users', (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  res.send(`User ${name} with email ${email} created!`);
});
```

---

### 4. `req.headers` (Metadata & Authentication)
* **What it is**: Hidden metadata sent along with the request (e.g., security tokens, browser info).
* **When to use**: Checking login tokens (`Authorization`) or content type.

```javascript
app.get('/secret-data', (req, res) => {
  const userToken = req.headers['authorization'];
  res.send(`Received header auth token: ${userToken}`);
});
```

---

## 5. Writing Simple GET Endpoints (Hands-On Code)

Here is a complete, beginner-friendly `index.js` file with clean GET routes:

```javascript
const express = require('express');
const app = express();
const PORT = 3000;

// Sample list of student objects
const students = [
  { id: 1, name: "Alice", course: "Web Dev" },
  { id: 2, name: "Bob", course: "Data Science" },
  { id: 3, name: "Charlie", course: "Web Dev" }
];

// GET Route 1: Welcome Home Route
app.get('/', (req, res) => {
  res.send('Welcome to Student Portal API!');
});

// GET Route 2: Get All Students (with Query Param filtering)
// Example URL: http://localhost:3000/api/students?course=Web Dev
app.get('/api/students', (req, res) => {
  const courseFilter = req.query.course;

  if (courseFilter) {
    const filtered = students.filter(s => s.course.toLowerCase() === courseFilter.toLowerCase());
    return res.json(filtered);
  }

  // If no query parameter, return all students
  res.json(students);
});

// GET Route 3: Get Single Student by ID (using req.params)
// Example URL: http://localhost:3000/api/students/2
app.get('/api/students/:id', (req, res) => {
  const studentId = parseInt(req.params.id, 10);
  const student = students.find(s => s.id === studentId);

  if (!student) {
    return res.status(404).json({ message: "Student not found!" });
  }

  res.json(student);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
```

---

## 6. Testing Your GET Endpoints using Postman

**Postman** is a tool to test your API routes easily without building a frontend UI.

### Step-by-Step Postman Testing Guide:

1. **Start your server in terminal**:
   ```bash
   node index.js
   ```
2. **Open Postman** and click the **`+`** button to open a new tab.

#### Test 1: Simple GET Route
* Set HTTP Method to **`GET`**.
* URL: `http://localhost:3000/`
* Click **Send**.
* You should see response text: `"Welcome to Student Portal API!"` with status `200 OK`.

#### Test 2: GET with Path Parameter (`req.params`)
* Method: **`GET`**
* URL: `http://localhost:3000/api/students/1`
* Click **Send**.
* You should see JSON response:
  ```json
  {
    "id": 1,
    "name": "Alice",
    "course": "Web Dev"
  }
  ```

#### Test 3: GET with Query Parameter (`req.query`)
* Method: **`GET`**
* URL: `http://localhost:3000/api/students`
* Click **Params** tab below URL bar.
* Enter:
  * **Key**: `course`
  * **Value**: `Web Dev`
* Click **Send**.
* URL automatically changes to `http://localhost:3000/api/students?course=Web%20Dev`.
* Response will return only students enrolled in Web Dev.

#### Test 4: Testing Headers (`req.headers`)
* Click **Headers** tab in Postman.
* Add Key: `Authorization`, Value: `Bearer my-secret-token`.
* Click **Send** to verify header reception.

---

## Quick Classroom Summary Checklist
- [x] **Why Backend**: Keeps secrets safe, connects to database, handles business logic.
- [x] **Node Setup**: `mkdir` -> `npm init -y` -> `npm install express` -> create `index.js` -> `node index.js`.
- [x] **Basic Route**: `app.get('/path', (req, res) => { res.send('...') })`.
- [x] **4 Input Types**: `req.params` (ID in path), `req.query` (filters in URL), `req.body` (JSON payload), `req.headers` (metadata/auth).
- [x] **Postman**: Send GET requests and test parameters and responses visually.
