import { useState, useEffect } from "react";
import {
  getAuthors, createAuthor, deleteAuthor,
  getBooks, createBook, updateBook, deleteBook,
} from "../api";

function MongoDoc({ obj }) {
  const lines = Object.entries(obj).map(([k, v]) => {
    const isRef = k.endsWith("Id") || k.endsWith("Ids");
    if (Array.isArray(v)) {
      return `  <span class="key">"${k}"</span>: [${v.map(x => `<span class="ref">"${x}"</span>`).join(", ")}]`;
    }
    if (typeof v === "number") {
      return `  <span class="key">"${k}"</span>: <span class="num">${v}</span>`;
    }
    const cls = k === "_id" || isRef ? "ref" : "str";
    return `  <span class="key">"${k}"</span>: <span class="${cls}">"${v}"</span>`;
  });
  return (
    <div
      className="mongo-doc"
      dangerouslySetInnerHTML={{ __html: "{\n" + lines.join(",\n") + "\n}" }}
    />
  );
}

export default function OneToMany() {
  const [authors, setAuthors] = useState([]);
  const [books, setBooks] = useState([]);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [bookYear, setBookYear] = useState("2024");
  const [bookAuthorId, setBookAuthorId] = useState("");
  const [editBookId, setEditBookId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [showDoc, setShowDoc] = useState(null);

  const reload = async () => {
    setAuthors(await getAuthors());
    setBooks(await getBooks());
  };

  useEffect(() => { reload(); }, []);

  const handleAddAuthor = async () => {
    if (!authorName.trim()) return;
    await createAuthor({ name: authorName.trim(), email: authorEmail.trim() });
    setAuthorName(""); setAuthorEmail("");
    reload();
  };

  const handleDeleteAuthor = async (id) => {
    await deleteAuthor(id);
    reload();
  };

  const handleAddBook = async () => {
    if (!bookTitle.trim() || !bookAuthorId) return;
    await createBook({ title: bookTitle.trim(), year: parseInt(bookYear), authorId: bookAuthorId });
    setBookTitle(""); setBookAuthorId("");
    reload();
  };

  const handleSaveBook = async (id) => {
    await updateBook(id, { title: editTitle });
    setEditBookId(null);
    reload();
  };

  const handleDeleteBook = async (id) => {
    await deleteBook(id);
    reload();
  };

  const booksOf = (authorId) => books.filter(b => {
    const ref = b.authorId?._id || b.authorId;
    return ref === authorId;
  });

  const authorOf = (book) => book.authorId?.name || "—";

  return (
    <div>
      <div className="info-box">
        <strong>One-to-Many:</strong> One Author → many Books. The foreign key <code>authorId</code> lives
        inside each Book document, referencing the Author's <code>_id</code>.
        Deleting an author cascades and removes all their books.
      </div>

      <div className="grid2">
        {/* ── Authors ── */}
        <div>
          <div className="section-label">Authors collection</div>
          {authors.map(a => (
            <div className="card" key={a._id}>
              <div className="card-header">
                <div>
                  <div className="card-title">{a.name}</div>
                  <div className="card-sub">{a.email}</div>
                </div>
                <div className="actions">
                  <button className="btn" onClick={() => setShowDoc(showDoc === a._id ? null : a._id)}>JSON</button>
                  <button className="btn btn-danger" onClick={() => handleDeleteAuthor(a._id)}>Delete</button>
                </div>
              </div>
              <div className="rel-line">
                <span className="rel-tag one-many">1 → N</span>
                {booksOf(a._id).map(b => (
                  <span key={b._id} className="badge badge-teal">{b.title}</span>
                ))}
                {booksOf(a._id).length === 0 && <span>no books</span>}
              </div>
              {showDoc === a._id && <MongoDoc obj={{ _id: a._id, name: a.name, email: a.email }} />}
            </div>
          ))}

          <div className="card dashed">
            <div className="section-label" style={{ marginBottom: 8 }}>Insert author</div>
            <div className="form-row">
              <label>Name</label>
              <input value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="form-row">
              <label>Email</label>
              <input value={authorEmail} onChange={e => setAuthorEmail(e.target.value)} placeholder="email@example.com" />
            </div>
            <button className="btn btn-primary" onClick={handleAddAuthor}>+ Insert</button>
          </div>
        </div>

        {/* ── Books ── */}
        <div>
          <div className="section-label">Books collection</div>
          {books.map(b => (
            <div className="card" key={b._id}>
              <div className="card-header">
                <div>
                  {editBookId === b._id
                    ? <input
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        style={{ fontSize: 13, padding: "4px 8px", border: "1px solid #d4d0c8", borderRadius: 6 }}
                      />
                    : <div className="card-title">{b.title}</div>
                  }
                  <div className="card-sub">{b.year}</div>
                </div>
                <div className="actions">
                  {editBookId === b._id
                    ? <button className="btn btn-primary" onClick={() => handleSaveBook(b._id)}>Save</button>
                    : <button className="btn" onClick={() => { setEditBookId(b._id); setEditTitle(b.title); }}>Edit</button>
                  }
                  <button className="btn btn-danger" onClick={() => handleDeleteBook(b._id)}>Delete</button>
                </div>
              </div>
              <div className="rel-line">
                <span className="rel-tag one-many">N → 1</span>
                <span className="badge badge-purple">{authorOf(b)}</span>
              </div>
              <button
                className="btn"
                style={{ marginTop: 6, fontSize: 11 }}
                onClick={() => setShowDoc(showDoc === b._id ? null : b._id)}
              >
                JSON
              </button>
              {showDoc === b._id && (
                <MongoDoc obj={{ _id: b._id, title: b.title, year: b.year, authorId: b.authorId?._id || b.authorId }} />
              )}
            </div>
          ))}

          <div className="card dashed">
            <div className="section-label" style={{ marginBottom: 8 }}>Insert book</div>
            <div className="form-row">
              <label>Title</label>
              <input value={bookTitle} onChange={e => setBookTitle(e.target.value)} placeholder="Book title" />
            </div>
            <div className="form-row">
              <label>Year</label>
              <input value={bookYear} onChange={e => setBookYear(e.target.value)} type="number" style={{ maxWidth: 90 }} />
            </div>
            <div className="form-row">
              <label>Author</label>
              <select value={bookAuthorId} onChange={e => setBookAuthorId(e.target.value)}>
                <option value="">Select author…</option>
                {authors.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleAddBook}>+ Insert</button>
          </div>
        </div>
      </div>
    </div>
  );
}
