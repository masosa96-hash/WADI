import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRunsStore } from "../store/runsStore";

export default function ProjectDetail() {
  const { id } = useParams();
  const { runs, fetchRuns, createRun, loading } = useRunsStore();

  const [input, setInput] = useState("");

  useEffect(() => {
    fetchRuns(id!);
  }, [id]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await createRun(id!, input);
    setInput("");
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Proyecto {id}</h2>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Escribí algo..."
        style={{ width: "100%", height: 100 }}
      />

      <br />

      <button onClick={handleSend} disabled={loading}>
        Enviar
      </button>

      <hr />

      {runs.map((r) => (
        <div key={r.id} style={{ marginBottom: 20 }}>
          <b>Input:</b> {r.input}
          <br />
          <b>Output:</b> {r.output}
          <br />
          <small>{r.created_at}</small>
        </div>
      ))}
    </div>
  );
}
