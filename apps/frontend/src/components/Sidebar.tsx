import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

export function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Placeholder nav items
  const navItems = [{ label: "Dashboard", path: "/projects" }];

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
          <span>+</span> New Conversation
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "var(--bg-element)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-2)",
            border: "1px solid transparent",
          }}
        >
          <span style={{ opacity: 0.5, marginRight: "var(--space-2)" }}>
            🔍
          </span>
          <input
            placeholder="Search..."
            style={{ width: "100%", fontSize: "0.9rem" }}
            aria-label="Search conversations"
          />
        </div>
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
          Menu
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
            }}
          >
            Dashboard
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          {/* Avatar Placeholder */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "var(--bg-element-hover)",
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.875rem",
              fontWeight: "bold",
            }}
          >
            U
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>User</span>
            <small style={{ fontSize: "0.7rem", color: "var(--success)" }}>
              ● Online
            </small>
          </div>
        </div>
      </div>
    </aside>
  );
}
