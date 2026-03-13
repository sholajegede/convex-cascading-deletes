import "./App.css";
import { useAction, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

function App() {
  const [table, setTable] = useState("users");
  const [id, setId] = useState("");
  const [submittedTable, setSubmittedTable] = useState("");
  const [submittedId, setSubmittedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const deleteWithCascade = useAction(api.example.deleteWithCascade);
  const log = useQuery(
    api.example.getDeletionLog,
    submittedId ? { table: submittedTable, id: submittedId } : "skip",
  );

  const handleDelete = async () => {
    if (!table.trim() || !id.trim()) return;
    setLoading(true);
    setSubmittedTable(table);
    setSubmittedId(id);
    try {
      const counts = await deleteWithCascade({ table, id });
      setResult(JSON.stringify(counts, null, 2));
    } catch (e: any) {
      setResult(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  return (
    <>
      <h1>convex-cascading-deletes</h1>
      <p style={{ color: "#888", marginBottom: "2rem" }}>
        Delete a record and all its dependents in one call
      </p>
      <div className="card">
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <input
            type="text"
            value={table}
            onChange={(e) => setTable(e.target.value)}
            placeholder="table name"
            style={{ flex: 1, padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="record id"
            style={{ flex: 2, padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <button onClick={handleDelete} disabled={loading} style={{ padding: "0.5rem 1rem" }}>
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
        {result && (
          <div style={{ textAlign: "left" }}>
            <h3>Deleted counts</h3>
            <pre style={{ background: "rgba(0,0,0,0.05)", padding: "1rem", borderRadius: "4px" }}>
              {result}
            </pre>
          </div>
        )}
        {log && (
          <div style={{ textAlign: "left", marginTop: "1rem" }}>
            <h3>Deletion log</h3>
            <pre style={{ background: "rgba(0,0,0,0.05)", padding: "1rem", borderRadius: "4px", fontSize: "0.75rem" }}>
              {JSON.stringify(log, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
