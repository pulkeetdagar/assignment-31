const BASE = "http://server:5001";;

// ── Authors ──────────────────────────────────────────────────────────────────
export const getAuthors = () => fetch(`${BASE}/authors`).then(r => r.json());
export const createAuthor = (data) =>
  fetch(`${BASE}/authors`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json());
export const updateAuthor = (id, data) =>
  fetch(`${BASE}/authors/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json());
export const deleteAuthor = (id) =>
  fetch(`${BASE}/authors/${id}`, { method: "DELETE" }).then(r => r.json());

// ── Books ────────────────────────────────────────────────────────────────────
export const getBooks = () => fetch(`${BASE}/books`).then(r => r.json());
export const createBook = (data) =>
  fetch(`${BASE}/books`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json());
export const updateBook = (id, data) =>
  fetch(`${BASE}/books/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json());
export const deleteBook = (id) =>
  fetch(`${BASE}/books/${id}`, { method: "DELETE" }).then(r => r.json());

// ── Students ─────────────────────────────────────────────────────────────────
export const getStudents = () => fetch(`${BASE}/students`).then(r => r.json());
export const createStudent = (data) =>
  fetch(`${BASE}/students`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json());
export const deleteStudent = (id) =>
  fetch(`${BASE}/students/${id}`, { method: "DELETE" }).then(r => r.json());

// ── Courses ──────────────────────────────────────────────────────────────────
export const getCourses = () => fetch(`${BASE}/courses`).then(r => r.json());
export const createCourse = (data) =>
  fetch(`${BASE}/courses`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json());
export const deleteCourse = (id) =>
  fetch(`${BASE}/courses/${id}`, { method: "DELETE" }).then(r => r.json());

// ── Enrollments ───────────────────────────────────────────────────────────────
export const getEnrollments = () => fetch(`${BASE}/enrollments`).then(r => r.json());
export const enroll = (studentId, courseId) =>
  fetch(`${BASE}/enrollments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId, courseId }) }).then(r => r.json());
export const unenroll = (studentId, courseId) =>
  fetch(`${BASE}/enrollments`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId, courseId }) }).then(r => r.json());