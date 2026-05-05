const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
 
const app = express();
app.use(cors());
app.use(express.json());
 

mongoose.connect(process.env.MONGO_URI);;
 
// ─── SCHEMAS ──────────────────────────────────────────────────────────────────
 
// ONE-TO-MANY: One Author → many Books
const authorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
});
 
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "Author", required: true },
});
 
// MANY-TO-MANY: Students ↔ Courses via Enrollment join collection
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
});
 
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
});
 
const enrollmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
});
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
 
const Author = mongoose.model("Author", authorSchema);
const Book = mongoose.model("Book", bookSchema);
const Student = mongoose.model("Student", studentSchema);
const Course = mongoose.model("Course", courseSchema);
const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
 
// ─── AUTHOR ROUTES (1:Many parent) ───────────────────────────────────────────
 
app.get("/authors", async (req, res) => {
  const authors = await Author.find();
  res.json(authors);
});
 
app.post("/authors", async (req, res) => {
  const author = await Author.create(req.body);
  res.status(201).json(author);
});
 
app.put("/authors/:id", async (req, res) => {
  const author = await Author.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(author);
});
 
app.delete("/authors/:id", async (req, res) => {
  await Author.findByIdAndDelete(req.params.id);
  // Cascade delete books whose author was removed
  await Book.deleteMany({ authorId: req.params.id });
  res.json({ message: "Author and their books deleted" });
});
 
// ─── BOOK ROUTES (1:Many child) ───────────────────────────────────────────────
 
// Get all books — populated with author info ($lookup equivalent)
app.get("/books", async (req, res) => {
  const books = await Book.find().populate("authorId", "name email");
  res.json(books);
});
 
// Get all books by a specific author
app.get("/books/by-author/:authorId", async (req, res) => {
  const books = await Book.find({ authorId: req.params.authorId }).populate("authorId", "name");
  res.json(books);
});
 
app.post("/books", async (req, res) => {
  const book = await Book.create(req.body);
  res.status(201).json(book);
});
 
app.put("/books/:id", async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(book);
});
 
app.delete("/books/:id", async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ message: "Book deleted" });
});
 
// ─── STUDENT ROUTES (M:Many) ──────────────────────────────────────────────────
 
app.get("/students", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});
 
// Get student with all enrolled courses (two-hop $lookup via Enrollment)
app.get("/students/:id/courses", async (req, res) => {
  const result = await Student.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
    {
      $lookup: {
        from: "enrollments",
        localField: "_id",
        foreignField: "studentId",
        as: "enrollments",
      },
    },
    {
      $lookup: {
        from: "courses",
        localField: "enrollments.courseId",
        foreignField: "_id",
        as: "courses",
      },
    },
    { $project: { name: 1, courses: 1 } },
  ]);
  res.json(result[0] || null);
});
 
app.post("/students", async (req, res) => {
  const student = await Student.create(req.body);
  res.status(201).json(student);
});
 
app.delete("/students/:id", async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  await Enrollment.deleteMany({ studentId: req.params.id });
  res.json({ message: "Student and enrollments deleted" });
});
 
// ─── COURSE ROUTES (M:Many) ───────────────────────────────────────────────────
 
app.get("/courses", async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});
 
app.post("/courses", async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json(course);
});
 
app.delete("/courses/:id", async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  await Enrollment.deleteMany({ courseId: req.params.id });
  res.json({ message: "Course and enrollments deleted" });
});
 
// ─── ENROLLMENT ROUTES (join table for M:Many) ────────────────────────────────
 
app.get("/enrollments", async (req, res) => {
  const enrollments = await Enrollment.find()
    .populate("studentId", "name")
    .populate("courseId", "title");
  res.json(enrollments);
});
 
app.post("/enrollments", async (req, res) => {
  try {
    const enrollment = await Enrollment.create(req.body);
    res.status(201).json(enrollment);
  } catch (err) {
    if (err.code === 11000) {
      res.status(409).json({ error: "Already enrolled" });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
});
 
app.delete("/enrollments", async (req, res) => {
  const { studentId, courseId } = req.body;
  await Enrollment.findOneAndDelete({ studentId, courseId });
  res.json({ message: "Unenrolled" });
});
 
// ─── START ────────────────────────────────────────────────────────────────────
app.listen(5001, () => console.log("Server running on http://localhost:5000"));