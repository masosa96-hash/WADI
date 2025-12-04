import { useEffect, useState } from "react";
import { useProjectsStore } from "../store/projectsStore";
import { useAuthStore } from "../store/authStore";

export default function Projects() {
  const { user, signOut } = useAuthStore();
  const { projects, fetchProjects, createProject, loading } = useProjectsStore();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    await createProject(name, desc);
    setName("");
    setDesc("");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Proyectos</h1>
      <p>Usuario: {user?.email}</p>

      <button onClick={signOut}>Salir</button>

      <hr />

      <h3>Crear Proyecto</h3>
      <form onSubmit={handleCreate}>
        <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Descripción" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <button>Crear</button>
      </form>

      <hr />

      {loading && <p>Cargando...</p>}

      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            {p.name} — {p.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

