import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import { useState } from "react";
import { Modal } from "./common/Modal";
import { Input } from "./common/Input";
import { Button } from "./common/Button";

import { TutorSetupModal } from "./tutor/TutorSetupModal";

export function Sidebar() {
  const location = useLocation();
  const { user, convertGuestToUser, signOut } = useAuthStore();
  const { resetChat } = useChatStore();
  const isAnonymous = user?.is_anonymous;

  const [showRegister, setShowRegister] = useState(false);
  const [showTutorModal, setShowTutorModal] = useState(false);
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
        width: "280px",
        height: "100vh",
        background: "var(--bg-panel)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Brand */}
      <div style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.8rem",
            fontWeight: 900,
            letterSpacing: "-0.5px",
            background: "var(--grad-main)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 0,
          }}
        >
          WADI
        </h2>
        <small
          style={{
            fontSize: "0.8rem",
            color: "var(--text-tertiary)",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          Agentic Workspace
        </small>
      </div>

      {/* New Chat & Search */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
          marginBottom: "2rem",
        }}
      >
        <Link
          to="/chat"
          onClick={resetChat}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            background: "var(--grad-secondary)",
            color: "#000",
            padding: "0.8rem",
            borderRadius: "var(--radius-lg)",
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.02)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <span style={{ fontSize: "1.2rem" }}>+</span> Nueva Conversación
        </Link>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          overflowY: "auto",
        }}
      >
        <Link
          to="/"
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            backgroundColor: isActive("/") ? "rgba(0,0,0,0.05)" : "transparent",
            color: isActive("/")
              ? "var(--text-primary)"
              : "var(--text-secondary)",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            textDecoration: "none",
            fontWeight: isActive("/") ? 600 : 400,
            border: isActive("/")
              ? "1px solid var(--border-subtle)"
              : "1px solid transparent",
          }}
        >
          <span>🏠</span> Home
        </Link>

        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: isActive(item.path)
                ? "rgba(0,0,0,0.05)"
                : "transparent",
              color: isActive(item.path)
                ? "var(--text-primary)"
                : "var(--text-secondary)",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              textDecoration: "none",
              fontWeight: isActive(item.path) ? 600 : 400,
              border: isActive(item.path)
                ? "1px solid var(--border-subtle)"
                : "1px solid transparent",
            }}
          >
            <span>🚀</span> {item.label}
          </Link>
        ))}

        <div
          style={{
            fontSize: "0.7rem",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
            marginBottom: "0.5rem",
            marginTop: "1.5rem",
            letterSpacing: "1px",
            paddingLeft: "1rem",
          }}
        >
          Herramientas
        </div>

        <Button
          variant="ghost"
          style={{
            justifyContent: "flex-start",
            gap: "0.75rem",
            color: "var(--text-secondary)",
            fontWeight: 400,
          }}
          onClick={() => setShowTutorModal(true)}
        >
          <span>📚</span> Modo Tutor
        </Button>
      </nav>

      {/* Footer / Profile */}
      <div
        style={{
          marginTop: "auto",
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <ThemeToggle />

        {isAnonymous ? (
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.5)",
              padding: "1rem",
              borderRadius: "1rem",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                marginBottom: "0.75rem",
                lineHeight: "1.4",
              }}
            >
              Estás en Modo Invitado.
            </p>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => setShowRegister(true)}
              style={{ fontSize: "0.85rem", background: "#fff" }}
            >
              ☁️ Crear Cuenta
            </Button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              justifyContent: "space-between",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              background: "rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--grad-main)",
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
                    fontWeight: 600,
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
                padding: "4px",
                borderRadius: "4px",
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
        title="Crear tu cuenta"
      >
        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
            marginBottom: "1.5rem",
          }}
        >
          Guardá tus proyectos y accedé a todas las funciones premium de WADI.
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
            placeholder="tu@email.com"
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
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
              onClick={() => setShowRegister(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              style={{ background: "var(--grad-main)", border: "none" }}
            >
              {loading ? "Creando..." : "Registrarme"}
            </Button>
          </div>
        </form>
      </Modal>

      <TutorSetupModal
        isOpen={showTutorModal}
        onClose={() => setShowTutorModal(false)}
      />
    </aside>
  );
}
