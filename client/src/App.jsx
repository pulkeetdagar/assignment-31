import { useState } from "react";
import OneToMany from "./components/OneToMany";
import ManyToMany from "./components/ManyToMany";
import SchemaView from "./components/SchemaView";
import "./App.css";

export default function App() {
  const [tab, setTab] = useState("1m");

  return (
    <div className="app">
      <header className="header">
        <h1>MongoDB CRUD — Relationships Demo</h1>
        <p>Simulated MongoDB collections with live CRUD · One-to-Many &amp; Many-to-Many</p>
      </header>

      <div className="tabs">
        <button className={`tab ${tab === "1m" ? "active" : ""}`} onClick={() => setTab("1m")}>
          1 : Many — Author / Books
        </button>
        <button className={`tab ${tab === "mm" ? "active" : ""}`} onClick={() => setTab("mm")}>
          M : Many — Student / Courses
        </button>
        <button className={`tab ${tab === "schema" ? "active" : ""}`} onClick={() => setTab("schema")}>
          Schema &amp; Queries
        </button>
      </div>

      <main className="content">
        {tab === "1m" && <OneToMany />}
        {tab === "mm" && <ManyToMany />}
        {tab === "schema" && <SchemaView />}
      </main>
    </div>
  );
}
