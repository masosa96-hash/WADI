import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useProjectsStore } from "../store/projectsStore";
import { Layout } from "../components/Layout";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Modal } from "../components/common/Modal";

export default function Projects() {
  const { projects, fetchProjects, createProject, loading } =
    useProjectsStore();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("El nombre es obligatorio");
      return;
    }

    // Clear previous errors
    setNameError("");

    try {
      await createProject(name, desc);
      setName("");
      setDesc("");
      setIsCreating(false);
    } catch (err) {
      console.error("Error creating project:", err);
      // Ideally show a toast here
    }
  };

  const openCreateModal = () => {
    setNameError("");
    setIsCreating(true);
  };

  return (
    <Layout>
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "2rem",
          background: "var(--bg-app)",
          minHeight: "100%",
        }}
      >
        {/* Header simple */}
        <header
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "2rem",
          }}
        >
          {/* User profile placeholder if we wanted one, handled by Sidebar */}
        </header>

        {/* Hero Section */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              background: "var(--grad-secondary)",
              borderRadius: "50%",
              margin: "0 auto 1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.5rem",
              boxShadow: "0 0 20px rgba(52, 211, 153, 0.4)",
            }}
          >
            🚀
          </div>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              marginBottom: "0.5rem",
              background: "var(--grad-main)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Punto de Control
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
            ¿En qué trabajamos hoy?
          </p>
        </div>

        {/* Action Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            marginBottom: "3rem",
          }}
        >
          {/* Card 1: New Project */}
          <Card
            hoverable
            onClick={openCreateModal}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              alignItems: "flex-start",
              textAlign: "left",
              padding: "2rem",
              border: "1px solid var(--accent-primary)",
              background: "rgba(124, 58, 237, 0.03)",
            }}
          >
            <div style={{ color: "var(--accent-primary)", fontSize: "2rem" }}>
              ✨
            </div>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "0.5rem",
                }}
              >
                Crear nuevo proyecto
              </span>
              <span
                style={{
                  fontSize: "0.95rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                Inicia una nueva sesión de trabajo desde cero.
              </span>
            </div>
          </Card>

          {/* Card 2: Explore */}
          <Card
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              opacity: 0.8,
              padding: "2rem",
              background: "#fff",
            }}
          >
            <div style={{ color: "var(--success)", fontSize: "2rem" }}>📚</div>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "0.5rem",
                }}
              >
                Explorar recursos
              </span>
              <span
                style={{
                  fontSize: "0.95rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                Documentación y guías (Próximamente).
              </span>
            </div>
          </Card>
        </div>

        {/* Recent Projects List */}
        <div>
          <h3
            style={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "var(--text-tertiary)",
              marginBottom: "1rem",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              paddingLeft: "0.5rem",
            }}
          >
            Recientes
          </h3>

          {loading && (
            <p style={{ color: "var(--text-tertiary)", paddingLeft: "0.5rem" }}>
              Cargando...
            </p>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {projects.map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                style={{ textDecoration: "none" }}
              >
                <Card
                  hoverable
                  style={{
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: "1rem",
                    border: "1px solid var(--border-subtle)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        background: "var(--bg-element)",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem",
                      }}
                    >
                      📄
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "1.05rem",
                          color: "var(--text-primary)",
                          marginBottom: "0.2rem",
                        }}
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
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-tertiary)",
                      background: "var(--bg-element)",
                      padding: "4px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </Card>
              </Link>
            ))}

            {projects.length === 0 && !loading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  background: "rgba(255,255,255,0.5)",
                  borderRadius: "1rem",
                  border: "1px dashed var(--border-subtle)",
                }}
              >
                <p style={{ color: "var(--text-secondary)" }}>
                  No hay proyectos recientes. ¡Crea el primero arriba!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal for Creating Project */}
        <Modal
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
          title="Nuevo Proyecto"
        >
          <form
            onSubmit={handleCreate}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <Input
              label="Nombre del proyecto"
              placeholder="Ej. Análisis de datos"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setNameError("");
              }}
              error={nameError}
              autoFocus
            />
            <Input
              label="Descripción (opcional)"
              placeholder="Breve descripción del objetivo"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.5rem",
                marginTop: "1rem",
              }}
            >
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreating(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Crear Proyecto
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
