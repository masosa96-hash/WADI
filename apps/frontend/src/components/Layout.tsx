import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useChatStore } from "../store/chatStore";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { resetChat } = useChatStore();
  const navigate = useNavigate();

  const handleNewChat = () => {
    resetChat();
    navigate("/chat");
    setSidebarOpen(false);
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay mobile-only"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--color-bg)",
          overflow: "hidden",
          position: "relative",
          width: "100%", // Ensure full width
        }}
      >
        {/* Mobile Top Bar */}
        <div
          className="mobile-only"
          style={{
            height: "60px",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 1rem",
            flexShrink: 0,
            zIndex: 40,
          }}
        >
          {/* Left: Hamburger & Logo */}
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                fontSize: "1.5rem",
                color: "var(--color-text-soft)",
                padding: "0.25rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              ☰
            </button>
            <Link to="/" style={{ textDecoration: "none" }}>
              <span
                style={{
                  fontWeight: 900,
                  fontSize: "1.2rem",
                  background: "var(--grad-main)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                WADI
              </span>
            </Link>
          </div>

          {/* Right: New Chat Button */}
          <button
            onClick={handleNewChat}
            style={{
              background: "var(--color-primary)",
              color: "white",
              padding: "0.4rem 0.8rem",
              borderRadius: "999px",
              fontSize: "0.85rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <span>+</span> Nueva
          </button>
        </div>

        <main
          style={{
            flex: 1,
            overflow: "hidden", // Let children handle scroll (like ChatPage)
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
