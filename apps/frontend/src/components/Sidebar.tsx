import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { useAuthStore } from "../store/authStore";
import { useState } from "react";
import { Modal } from "./common/Modal";
import { Input } from "./common/Input";
import { Button } from "./common/Button";

export function Sidebar() {
  const location = useLocation();
  const { user, convertGuestToUser, signOut } = useAuthStore();
  const isAnonymous = user?.is_anonymous;

  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Placeholder nav items
  const navItems = [{ label: "Dashboard", path: "/projects" }];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await convertGuestToUser(email, password);
      if (error) throw error;
      setShowRegister(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside
      style={{
        width: "260px",
        height: "100vh",
        backgroundColor: "var(--bg-panel)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        padding: "var(--space-4)",
      }}
    >
      {/* Brand */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h2 style={{ fontSize: "1.25rem", color: "var(--accent-primary)" }}>
          WADI
        </h2>
        <small>Agentic Workspace</small>
      </div>

      {/* New Chat & Search */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
          marginBottom: "var(--space-4)",
        }}
      >
        <Link
          to="/projects"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-2)",
            backgroundColor: "var(--accent-primary)",
            color: "var(--accent-text)",
            padding: "var(--space-2)",
            borderRadius: "var(--radius-md)",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          <span>+</span> Nueva Conversación
        </Link>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            fontSize: "0.75rem",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
            marginBottom: "var(--space-2)",
            marginTop: "var(--space-2)",
          }}
        >
          Historial
        </div>

        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              padding: "var(--space-2) var(--space-3)",
              borderRadius: "var(--radius-md)",
              backgroundColor: isActive(item.path)
                ? "var(--bg-element)"
                : "transparent",
              color: isActive(item.path)
                ? "var(--text-primary)"
                : "var(--text-secondary)",
              transition: "background-color 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              textDecoration: "none",
            }}
          >
            Punto de Control
          </Link>
        ))}
      </nav>

      {/* Footer / Profile */}
      <div
        style={{
          marginTop: "auto",
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "var(--space-4)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        <ThemeToggle />

        {isAnonymous ? (
          <div
            style={{
              backgroundColor: "var(--bg-element)",
              padding: "var(--space-3)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                marginBottom: "var(--space-2)",
              }}
            >
              Modo Invitado
            </p>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => setShowRegister(true)}
              style={{ fontSize: "0.8rem" }}
            >
              ☁️ Guardar mis chats
            </Button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: "var(--accent-primary)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                }}
              >
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  maxWidth: "120px",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.email}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text-tertiary)",
                fontSize: "1.2rem",
              }}
              title="Cerrar sesión"
            >
              ⏏️
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        title="Guardar Cuenta"
      >
        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
            marginBottom: "1rem",
          }}
        >
          Registrate para no perder tus chats y acceder desde cualquier
          dispositivo.
        </p>
        <form
          onSubmit={handleRegister}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
            }}
          >
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowRegister(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Crear Cuenta"}
            </Button>
          </div>
        </form>
      </Modal>
    </aside>
  );
}
