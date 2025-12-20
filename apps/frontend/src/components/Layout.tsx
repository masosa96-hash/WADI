import { type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useChatStore } from "../store/chatStore";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isSidebarOpen, setSidebarOpen, toggleSidebar, resetChat, rank } =
    useChatStore();
  const navigate = useNavigate();

  const handleNewChat = () => {
    resetChat();
    navigate("/chat");
    setSidebarOpen(false);
  };

  // Immersion Logic: "Generador de Humo" gets a degraded experience
  const isLowRank = rank === "GENERADOR_DE_HUMO";
  const wrapperStyle = isLowRank
    ? { filter: "contrast(1.2) brightness(0.8) sepia(0.1)" }
    : {};

  return (
    <div
      className="flex w-full h-screen min-h-screen relative overflow-hidden bg-[var(--color-bg)] transition-all duration-1000"
      style={wrapperStyle}
    >
      {/* Chromatic Aberration for Low Rank (Overlay) */}
      {isLowRank && (
        <div
          className="pointer-events-none fixed inset-0 z-[99999] opacity-10 mix-blend-overlay bg-repeat"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #ff0000 25%, transparent 25%, transparent 75%, #00ff00 75%, #00ff00), linear-gradient(45deg, #0000ff 25%, transparent 25%, transparent 75%, #ff0000 75%, #ff0000)",
            backgroundSize: "4px 4px",
            animation: "noise 0.2s infinite",
          }}
        />
      )}
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col relative w-full overflow-hidden">
        {/* Mobile Top Bar */}
        <div className="mobile-only h-[60px] border-b border-[var(--color-border)] bg-[var(--color-surface)] items-center justify-between px-4 shrink-0 z-40">
          {/* Left: Hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="text-2xl text-[var(--color-text-soft)] p-3 flex items-center justify-center min-w-[44px] min-h-[44px]"
              aria-label="Abrir menú"
            >
              ☰
            </button>
            <Link to="/" className="no-underline">
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
              padding: "0.6rem 1rem",
              minHeight: "44px",
              borderRadius: "999px",
              fontSize: "0.9rem",
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

        <main className="flex-1 overflow-hidden relative flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
