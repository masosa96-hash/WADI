import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useProjectsStore } from "../store/projectsStore";
import { useAuthStore } from "../store/authStore";
import { Layout } from "../components/Layout";

export default function Projects() {
  const { user, signOut } = useAuthStore();
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
          padding: "var(--space-6)",
          maxWidth: "800px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-6)",
          }}
        >
          <div>
            <h1>Dashboard</h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Welcome back, {user?.email}
            </p>
          </div>
          <button
            onClick={signOut}
            style={{ color: "var(--error)", fontSize: "0.9rem" }}
          >
            Sign Out
          </button>
        </header>

        {/* Create Project Section */}
        <div style={{ marginBottom: "var(--space-8)" }}>
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              style={{
                backgroundColor: "var(--bg-element)",
                padding: "var(--space-3) var(--space-4)",
                borderRadius: "var(--radius-md)",
                width: "100%",
                textAlign: "left",
                border: "1px dashed var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              + Create new project context...
            </button>
          ) : (
            <form
              onSubmit={handleCreate}
              style={{
                backgroundColor: "var(--bg-panel)",
                padding: "var(--space-4)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <h3 style={{ marginBottom: "var(--space-3)" }}>New Project</h3>
              <div className="flex flex-col gap-2">
                <input
                  placeholder="Project Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    backgroundColor: "var(--bg-app)",
                    padding: "var(--space-2)",
                    borderRadius: "var(--radius-sm)",
                  }}
                  autoFocus
                />
                <input
                  placeholder="Description (optional)"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  style={{
                    backgroundColor: "var(--bg-app)",
                    padding: "var(--space-2)",
                    borderRadius: "var(--radius-sm)",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    gap: "var(--space-2)",
                    marginTop: "var(--space-2)",
                  }}
                >
                  <button
                    type="submit"
                    style={{
                      backgroundColor: "var(--accent-primary)",
                      color: "white",
                      borderRadius: "var(--radius-sm)",
                      padding: "var(--space-2) var(--space-4)",
                    }}
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        <div>
          <h3 style={{ marginBottom: "var(--space-4)" }}>Recent Projects</h3>
          {loading && <p>Loading projects...</p>}

          <div
            style={{
              display: "grid",
              gap: "var(--space-3)",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            }}
          >
            {projects.map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                style={{
                  textDecoration: "none",
                  backgroundColor: "var(--bg-element)",
                  padding: "var(--space-4)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid transparent",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-2)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border-focus)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "transparent")
                }
              >
                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                  {p.name}
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  {p.description || "No description"}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
