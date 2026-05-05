export default function SchemaView() {
  return (
    <div>
      <div className="info-box">
        MongoDB collection schemas used in this demo. Foreign keys are plain string ObjectIds —
        MongoDB does <strong>not</strong> enforce referential integrity natively; cascade deletes are handled in app logic.
      </div>

      <div className="grid2">
        {/* ── One-to-Many ── */}
        <div>
          <div className="section-label">One-to-Many pattern</div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 8 }}>Authors</div>
            <div className="mongo-doc">{`{
  _id:   ObjectId,   // auto-generated
  name:  String,
  email: String
}`}</div>
          </div>

          <div style={{ textAlign: "center", fontSize: 20, color: "#bbb", margin: "4px 0" }}>↕</div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 8 }}>
              Books <span className="badge badge-teal" style={{ marginLeft: 6 }}>FK lives here</span>
            </div>
            <div className="mongo-doc">{`{
  _id:      ObjectId,
  title:    String,
  year:     Number,
  authorId: ObjectId  // → Authors._id
}`}</div>
          </div>

          <div className="card" style={{ marginTop: 10 }}>
            <div className="card-title" style={{ marginBottom: 8 }}>Query: books by author</div>
            <div className="mongo-doc">{`// Simple find
db.books.find({ authorId: ObjectId("...") })

// Aggregate with $lookup (join)
db.authors.aggregate([
  { $match: { _id: ObjectId("...") } },
  { $lookup: {
      from: "books",
      localField: "_id",
      foreignField: "authorId",
      as: "books"
  }}
])`}</div>
          </div>
        </div>

        {/* ── Many-to-Many ── */}
        <div>
          <div className="section-label">Many-to-Many pattern</div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 8 }}>Students</div>
            <div className="mongo-doc">{`{
  _id:  ObjectId,
  name: String
}`}</div>
          </div>

          <div style={{ textAlign: "center", fontSize: 20, color: "#bbb", margin: "4px 0" }}>↕</div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 8 }}>
              Enrollments <span className="badge badge-purple" style={{ marginLeft: 6 }}>join collection</span>
            </div>
            <div className="mongo-doc">{`{
  studentId: ObjectId,  // → Students._id
  courseId:  ObjectId   // → Courses._id
  // unique compound index on both
}`}</div>
          </div>

          <div style={{ textAlign: "center", fontSize: 20, color: "#bbb", margin: "4px 0" }}>↕</div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 8 }}>Courses</div>
            <div className="mongo-doc">{`{
  _id:   ObjectId,
  title: String
}`}</div>
          </div>

          <div className="card" style={{ marginTop: 10 }}>
            <div className="card-title" style={{ marginBottom: 8 }}>Query: courses for a student</div>
            <div className="mongo-doc">{`db.students.aggregate([
  { $match: { _id: ObjectId("...") } },
  { $lookup: {
      from: "enrollments",
      localField: "_id",
      foreignField: "studentId",
      as: "enrs"
  }},
  { $lookup: {
      from: "courses",
      localField: "enrs.courseId",
      foreignField: "_id",
      as: "courses"
  }},
  { $project: { name: 1, courses: 1 } }
])`}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
