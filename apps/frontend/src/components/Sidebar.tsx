import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import { useState } from "react";
import { Modal } from "./common/Modal";
import { Input } from "./common/Input";
import { Button } from "./common/Button";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string; // To allow applying drawer class
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, convertGuestToUser, signOut } = useAuthStore();
  const { resetChat, setPreset } = useChatStore();
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

  const handleTutorClick = () => {
    setPreset("learning");
    navigate("/chat");
  };

  return (
    <aside
      className={`sidebar-drawer ${isOpen ? "open" : ""}`}
      style={{
        width: "280px",
        height: "100vh",
        background: "var(--color-surface)", // New token
        borderRight: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem",
        transition:
          "width 0.3s, transform 0.3s, background-color 0.2s, border-color 0.2s",
      }}
    >
      {/* Brand & Close Button */}
      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
        }}
      >
        <div>
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
              color: "var(--color-text-soft)",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Agentic Workspace
          </small>
        </div>

        {/* Mobile Close Button */}
        <button
          className="mobile-only"
          onClick={onClose}
          style={{
            fontSize: "1.5rem",
            color: "var(--color-text-soft)",
            padding: "0.25rem",
          }}
        >
          ✕
        </button>
      </div>

      {/* New Chat & Search */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
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
            background: "var(--color-primary)", // Soft Violet
            color: "#FFFFFF",
            padding: "0.8rem",
            borderRadius: "var(--radius-lg)",
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "var(--shadow-y2k)",
            transition: "transform 0.2s, background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.backgroundColor =
              "var(--color-primary-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.backgroundColor = "var(--color-primary)";
          }}
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
            backgroundColor: isActive("/")
              ? "var(--color-surface-soft)"
              : "transparent",
            color: isActive("/")
              ? "var(--color-text-main)"
              : "var(--color-text-soft)",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            textDecoration: "none",
            fontWeight: isActive("/") ? 600 : 400,
            border: isActive("/")
              ? "1px solid var(--color-border-active)"
              : "1px solid transparent",
          }}
          aria-label="Ir al inicio"
          title="Ir al inicio"
        >
          <span role="img" aria-label="Casa">
            🏠
          </span>{" "}
          Home
        </Link>

        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: isActive(item.path)
                ? "var(--color-surface-soft)"
                : "transparent",
              color: isActive(item.path)
                ? "var(--color-text-main)"
                : "var(--color-text-soft)",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              textDecoration: "none",
              fontWeight: isActive(item.path) ? 600 : 400,
              border: isActive(item.path)
                ? "1px solid var(--color-border-active)"
                : "1px solid transparent",
            }}
            aria-label={`Ir a ${item.label}`}
            title={`Ir a ${item.label}`}
          >
            <span role="img" aria-label="Cohete">
              🚀
            </span>{" "}
            {item.label}
          </Link>
        ))}

        <div
          style={{
            fontSize: "0.7rem",
            textTransform: "uppercase",
            color: "var(--color-text-soft)",
            marginBottom: "0.5rem",
            marginTop: "1.5rem",
            letterSpacing: "1px",
            paddingLeft: "1rem",
            fontWeight: 600,
          }}
        >
          Herramientas
        </div>

        <Button
          variant="ghost"
          style={{
            justifyContent: "flex-start",
            gap: "0.75rem",
            color: "var(--color-text-soft)",
            fontWeight: 400,
          }}
          onClick={handleTutorClick}
          aria-label="Activar Modo Tutor"
          title="Activar Modo Tutor"
        >
          <span role="img" aria-label="Libro">
            📚
          </span>{" "}
          Modo Tutor
        </Button>
      </nav>

      {/* Footer / Profile */}
      <div
        style={{
          marginTop: "auto",
          borderTop: "1px solid var(--color-border)",
          paddingTop: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {isAnonymous ? (
          <div
            className="compact-mobile"
            style={{
              backgroundColor: "var(--color-surface-soft)",
              padding: "1rem",
              borderRadius: "1rem",
              border: "1px solid var(--color-border)",
            }}
          >
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--color-text-soft)",
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
              style={{
                fontSize: "0.85rem",
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
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
              background: "var(--color-surface-soft)",
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
                    color: "var(--color-text-main)",
                  }}
                >
                  {user?.email}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--color-text-soft)",
                  }}
                >
                  Pro User
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-soft)",
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
            color: "var(--color-text-soft)",
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
              style={{
                background: "var(--grad-main)",
                border: "none",
                color: "#FFF",
              }}
            >
              {loading ? "Creando..." : "Registrarme"}
            </Button>
          </div>
        </form>
      </Modal>
    </aside>
  );
}
