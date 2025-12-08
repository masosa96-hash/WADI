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
          {/* User profile placeholder */}
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

        {/* Action Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "var(--space-4)",
            marginBottom: "var(--space-10)",
          }}
        >
          {/* Card 1: New Project */}
          <Card
            hoverable
            onClick={openCreateModal}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
              alignItems: "flex-start",
              textAlign: "left",
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
          </Card>

          {/* Card 2: Explore */}
          <Card
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
              opacity: 0.7,
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
          </Card>
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
                style={{ textDecoration: "none" }}
              >
                <Card
                  hoverable
                  style={{
                    padding: "var(--space-3) var(--space-4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
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
                        style={{
                          fontWeight: 500,
                          color: "var(--text-primary)",
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
                      fontSize: "0.85rem",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </Card>
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
              gap: "var(--space-3)",
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
                gap: "var(--space-2)",
                marginTop: "var(--space-2)",
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
                Crear
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
