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
          background: "var(--color-bg)",
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
              background: "var(--grad-secondary)", // Cyan to Lime
              borderRadius: "50%",
              margin: "0 auto 1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.5rem",
              boxShadow: "0 0 20px rgba(34, 211, 238, 0.4)", // Cyan shadow
            }}
          >
            🚀
          </div>
          <h1
            style={{
              fontSize: "var(--text-3xl)",
              fontWeight: 800,
              marginBottom: "0.5rem",
              background: "var(--grad-main)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Punto de Control
          </h1>
          <p
            style={{
              color: "var(--color-text-soft)",
              fontSize: "var(--text-lg)",
            }}
          >
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
              border: "1px solid var(--color-primary)",
              background: "rgba(139, 92, 246, 0.05)", // Very soft violet
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ color: "var(--color-primary)", fontSize: "2rem" }}>
              ✨
            </div>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "var(--text-xl)",
                  fontWeight: 700,
                  color: "var(--color-text-main)",
                  marginBottom: "0.5rem",
                }}
              >
                Crear nuevo proyecto
              </span>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-soft)",
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
              opacity: 0.9,
              padding: "2rem",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div style={{ color: "var(--color-success)", fontSize: "2rem" }}>
              📚
            </div>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "var(--text-xl)",
                  fontWeight: 700,
                  color: "var(--color-text-main)",
                  marginBottom: "0.5rem",
                }}
              >
                Explorar recursos
              </span>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-soft)",
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
              fontSize: "var(--text-xs)",
              fontWeight: 700,
              color: "var(--color-text-soft)",
              marginBottom: "1rem",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              paddingLeft: "0.5rem",
            }}
          >
            Recientes
          </h3>

          {loading && (
            <p
              style={{ color: "var(--color-text-soft)", paddingLeft: "0.5rem" }}
            >
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
                    border: "1px solid var(--color-border)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    background: "var(--color-surface)",
                    boxShadow: "var(--shadow-sm)",
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
                        background: "var(--color-surface-soft)",
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
                          fontSize: "var(--text-base)",
                          color: "var(--color-text-main)",
                          marginBottom: "0.2rem",
                        }}
                      >
                        {p.name}
                      </div>
                      {p.description && (
                        <div
                          style={{
                            fontSize: "var(--text-sm)",
                            color: "var(--color-text-soft)",
                          }}
                        >
                          {p.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-soft)",
                      background: "var(--color-surface-soft)",
                      padding: "4px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-soft)",
                      background: "var(--color-surface-soft)",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {/* Smoke Index Calculation */}
                    {(() => {
                      const noise = (p as any).noise_count || 0;
                      const total = (p as any).total_items_audited || 0;
                      const percentage =
                        total > 0 ? Math.round((noise / total) * 100) : 0;

                      let color = "var(--wadi-primary)";
                      let blink = false;

                      if (percentage > 50) {
                        color = "var(--wadi-alert)"; // Red
                        blink = true;
                      } else if (percentage > 20) {
                        color = "#fbbf24"; // Yellow/Amber
                      }

                      return (
                        <span
                          style={{
                            color: color,
                          }}
                          className={blink ? "animate-pulse" : ""}
                        >
                          [ÍNDICE_DE_HUMO: {percentage}%]
                        </span>
                      );
                    })()}
                  </span>
                </Card>
              </Link>
            ))}

            {projects.length === 0 && !loading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "4rem 2rem",
                  background: "var(--color-surface-soft)",
                  borderRadius: "1rem",
                  border: "2px dashed var(--color-border)",
                  display: "flex", // Flex
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div style={{ fontSize: "2rem" }}>🌱</div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "var(--text-lg)",
                    color: "var(--color-text-main)",
                  }}
                >
                  Tu espacio está limpio
                </h3>
                <p style={{ color: "var(--color-text-soft)", margin: 0 }}>
                  Aún no tienes proyectos. ¡Es hora de empezar algo nuevo!
                </p>
                <Button
                  onClick={openCreateModal}
                  variant="primary"
                  style={{ marginTop: "1rem" }}
                >
                  🚀 Creá tu primer proyecto
                </Button>
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
              <Button
                type="submit"
                variant="primary"
                style={{ background: "var(--color-primary)", border: "none" }}
              >
                Crear Proyecto
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
