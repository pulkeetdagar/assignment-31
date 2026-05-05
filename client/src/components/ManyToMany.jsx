import { useState, useEffect } from "react";
import {
  getStudents, createStudent, deleteStudent,
  getCourses, createCourse, deleteCourse,
  getEnrollments, enroll, unenroll,
} from "../api";

export default function ManyToMany() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [newStudent, setNewStudent] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [enrStudentId, setEnrStudentId] = useState("");
  const [enrCourseId, setEnrCourseId] = useState("");
  const [showDoc, setShowDoc] = useState(null);

  const reload = async () => {
    const [s, c, e] = await Promise.all([getStudents(), getCourses(), getEnrollments()]);
    setStudents(s); setCourses(c); setEnrollments(e);
  };
  useEffect(() => { reload(); }, []);

  const handleAddStudent = async () => {
    if (!newStudent.trim()) return;
    await createStudent({ name: newStudent.trim() });
    setNewStudent(""); reload();
  };
  const handleAddCourse = async () => {
    if (!newCourse.trim()) return;
    await createCourse({ title: newCourse.trim() });
    setNewCourse(""); reload();
  };
  const handleEnroll = async () => {
    if (!enrStudentId || !enrCourseId) return;
    await enroll(enrStudentId, enrCourseId);
    setEnrStudentId(""); setEnrCourseId(""); reload();
  };
  const handleDeleteStudent = async (id) => { await deleteStudent(id); reload(); };
  const handleDeleteCourse = async (id) => { await deleteCourse(id); reload(); };
  const handleUnenroll = async (sId, cId) => { await unenroll(sId, cId); reload(); };

  const coursesOf = (studentId) =>
    enrollments
      .filter(e => (e.studentId?._id || e.studentId) === studentId)
      .map(e => e.courseId)
      .filter(Boolean);

  const studentsOf = (courseId) =>
    enrollments
      .filter(e => (e.courseId?._id || e.courseId) === courseId)
      .map(e => e.studentId)
      .filter(Boolean);

  return (
    <div>
      <div className="info-box">
        <strong>Many-to-Many:</strong> Students enroll in many Courses; Courses have many Students.
        A separate <strong>Enrollments</strong> join collection stores <code>{"{ studentId, courseId }"}</code> pairs.
        Deleting either side cascades and removes the enrollment records.
      </div>

      <div className="grid2">
        {/* ── Students ── */}
        <div>
          <div className="section-label">Students collection</div>
          {students.map(s => (
            <div className="card" key={s._id}>
              <div className="card-header">
                <div>
                  <div className="card-title">{s.name}</div>
                  <div className="card-sub"><code style={{ fontSize: 10 }}>{s._id}</code></div>
                </div>
                <div className="actions">
                  <button className="btn" onClick={() => setShowDoc(showDoc === s._id ? null : s._id)}>JSON</button>
                  <button className="btn btn-danger" onClick={() => handleDeleteStudent(s._id)}>Delete</button>
                </div>
              </div>
              <div className="rel-line">
                <span className="rel-tag many-many">M → N</span>
                {coursesOf(s._id).map(c => (
                  <span className="chip" key={c._id || c}>
                    {c.title || c}
                    <span className="chip-remove" onClick={() => handleUnenroll(s._id, c._id || c)}>×</span>
                  </span>
                ))}
                {coursesOf(s._id).length === 0 && <span>not enrolled</span>}
              </div>
              {showDoc === s._id && (
                <div className="mongo-doc">{`{\n  "_id": "${s._id}",\n  "name": "${s.name}"\n}`}</div>
              )}
            </div>
          ))}

          <div className="card dashed">
            <div className="form-row">
              <input value={newStudent} onChange={e => setNewStudent(e.target.value)} placeholder="Student name" />
              <button className="btn btn-primary" onClick={handleAddStudent}>+ Add</button>
            </div>
          </div>
        </div>

        {/* ── Courses ── */}
        <div>
          <div className="section-label">Courses collection</div>
          {courses.map(c => (
            <div className="card" key={c._id}>
              <div className="card-header">
                <div>
                  <div className="card-title">{c.title}</div>
                  <div className="card-sub"><code style={{ fontSize: 10 }}>{c._id}</code></div>
                </div>
                <div className="actions">
                  <button className="btn" onClick={() => setShowDoc(showDoc === c._id ? null : c._id)}>JSON</button>
                  <button className="btn btn-danger" onClick={() => handleDeleteCourse(c._id)}>Delete</button>
                </div>
              </div>
              <div className="rel-line">
                <span className="rel-tag many-many">N → M</span>
                {studentsOf(c._id).map(s => (
                  <span className="chip" key={s._id || s}>
                    {s.name || s}
                    <span className="chip-remove" onClick={() => handleUnenroll(s._id || s, c._id)}>×</span>
                  </span>
                ))}
                {studentsOf(c._id).length === 0 && <span>no students</span>}
              </div>
              {showDoc === c._id && (
                <div className="mongo-doc">{`{\n  "_id": "${c._id}",\n  "title": "${c.title}"\n}`}</div>
              )}
            </div>
          ))}

          <div className="card dashed">
            <div className="form-row">
              <input value={newCourse} onChange={e => setNewCourse(e.target.value)} placeholder="Course title" />
              <button className="btn btn-primary" onClick={handleAddCourse}>+ Add</button>
            </div>
          </div>
        </div>
      </div>

      <hr />

      {/* ── Enrollments join table ── */}
      <div className="section-label">Enrollments join collection — ({enrollments.length} documents)</div>
      <div className="grid2">
        {enrollments.map((e, i) => {
          const s = e.studentId;
          const c = e.courseId;
          const sid = s?._id || s;
          const cid = c?._id || c;
          return (
            <div className="card" key={i} style={{ padding: "8px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span className="badge badge-blue">{s?.name || sid}</span>
                  <span style={{ fontSize: 12, color: "#aaa", margin: "0 6px" }}>↔</span>
                  <span className="badge badge-amber">{c?.title || cid}</span>
                </div>
                <button className="btn btn-danger" style={{ fontSize: 11 }} onClick={() => handleUnenroll(sid, cid)}>Del</button>
              </div>
              <div className="mongo-doc">{`{\n  "studentId": "${sid}",\n  "courseId": "${cid}"\n}`}</div>
            </div>
          );
        })}
        {enrollments.length === 0 && <div className="empty" style={{ gridColumn: "1/-1" }}>No enrollments yet.</div>}
      </div>

      {/* ── Enroll form ── */}
      <div className="card dashed" style={{ marginTop: 12 }}>
        <div className="section-label" style={{ marginBottom: 8 }}>Enroll student in course</div>
        <div className="form-row">
          <select value={enrStudentId} onChange={e => setEnrStudentId(e.target.value)}>
            <option value="">Select student…</option>
            {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select value={enrCourseId} onChange={e => setEnrCourseId(e.target.value)}>
            <option value="">Select course…</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
          <button className="btn btn-primary" onClick={handleEnroll}>Enroll</button>
        </div>
      </div>
    </div>
  );
}
