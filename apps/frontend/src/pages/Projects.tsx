import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useProjectsStore } from "../store/projectsStore";
// import { useAuthStore } from "../store/authStore";
import { Layout } from "../components/Layout";

export default function Projects() {
  // const { user, signOut } = useAuthStore();
  const { projects, fetchProjects, createProject, loading } =
    useProjectsStore();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createProject(name, desc);
    setName("");
    setDesc("");
    setIsCreating(false);
  };

  return (
    <Layout>
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          padding: "var(--space-6) var(--space-4)",
        }}
      >
        {/* Header simple */}
        <header
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "var(--space-8)",
          }}
        >
          {/* User profile could go here, or just stick to sidebar */}
        </header>

        {/* Hero Section */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-10)" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              backgroundColor: "var(--bg-element)",
              borderRadius: "50%",
              margin: "0 auto var(--space-4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
            }}
          >
            🚀
          </div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              marginBottom: "var(--space-2)",
            }}
          >
            Punto de Control
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
            ¿En qué trabajamos hoy?
          </p>
        </div>

        {/* Action Grid (Replica of screenshot style) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "var(--space-4)",
            marginBottom: "var(--space-10)",
          }}
        >
          {/* Card 1: New Project */}
          <button
            onClick={() => setIsCreating(true)}
            style={{
              textAlign: "left",
              backgroundColor: "var(--bg-panel)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-4)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
              cursor: "pointer",
              transition: "transform 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.borderColor = "var(--border-focus)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "var(--border-subtle)";
            }}
          >
            <div style={{ color: "var(--accent-primary)", fontSize: "1.5rem" }}>
              ✨
            </div>
            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
              Crear nuevo proyecto
            </span>
            <span
              style={{
                fontSize: "0.9rem",
                color: "var(--text-tertiary)",
                lineHeight: 1.4,
              }}
            >
              Inicia una nueva sesión de trabajo desde cero.
            </span>
          </button>

          {/* Card 2: Explore */}
          <div
            style={{
              backgroundColor: "var(--bg-panel)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-4)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
              opacity: 0.7, // Placeholder look
            }}
          >
            <div style={{ color: "var(--success)", fontSize: "1.5rem" }}>
              📚
            </div>
            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
              Explorar recursos
            </span>
            <span
              style={{
                fontSize: "0.9rem",
                color: "var(--text-tertiary)",
                lineHeight: 1.4,
              }}
            >
              Documentación y guías (Próximamente).
            </span>
          </div>
        </div>

        {/* Recent Projects List */}
        <div>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              marginBottom: "var(--space-4)",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Recientes
          </h3>

          {loading && (
            <p style={{ color: "var(--text-tertiary)" }}>Cargando...</p>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
            }}
          >
            {projects.map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "var(--space-3) var(--space-4)",
                  backgroundColor: "var(--bg-element)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid transparent",
                  textDecoration: "none",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--bg-element-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--bg-element)")
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>📄</span>
                  <div>
                    <div
                      style={{ fontWeight: 500, color: "var(--text-primary)" }}
                    >
                      {p.name}
                    </div>
                    {p.description && (
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {p.description}
                      </div>
                    )}
                  </div>
                </div>
                <span
                  style={{ fontSize: "0.85rem", color: "var(--text-tertiary)" }}
                >
                  {new Date(p.created_at).toLocaleDateString()}
                </span>
              </Link>
            ))}

            {projects.length === 0 && !loading && (
              <p style={{ color: "var(--text-tertiary)", fontStyle: "italic" }}>
                No hay proyectos recientes. ¡Crea el primero arriba!
              </p>
            )}
          </div>
        </div>

        {/* Modal for Creating Project */}
        {isCreating && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              backdropFilter: "blur(4px)",
            }}
          >
            <form
              onSubmit={handleCreate}
              style={{
                backgroundColor: "var(--bg-panel)",
                padding: "var(--space-6)",
                borderRadius: "var(--radius-lg)",
                width: "100%",
                maxWidth: "400px",
                boxShadow: "var(--shadow-xl)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <h3
                style={{ marginBottom: "var(--space-4)", fontSize: "1.25rem" }}
              >
                Nuevo Proyecto
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-3)",
                }}
              >
                <input
                  placeholder="Nombre del proyecto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    backgroundColor: "var(--bg-app)",
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                  autoFocus
                />
                <input
                  placeholder="Descripción (opcional)"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  style={{
                    backgroundColor: "var(--bg-app)",
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "var(--space-2)",
                    marginTop: "var(--space-2)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    style={{
                      padding: "8px 16px",
                      color: "var(--text-secondary)",
                      background: "transparent",
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: "var(--text-primary)", // Botón sólido
                      color: "var(--bg-app)",
                      borderRadius: "var(--radius-md)",
                      padding: "8px 20px",
                      fontWeight: 600,
                    }}
                  >
                    Crear
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
