import { type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useChatStore } from "../store/chatStore";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isSidebarOpen, setSidebarOpen, toggleSidebar, resetChat } =
    useChatStore();
  const navigate = useNavigate();

  const handleNewChat = () => {
    resetChat();
    navigate("/chat");
    setSidebarOpen(false);
  };

  return (
    <div className="flex w-full h-full relative overflow-hidden bg-[var(--color-bg)]">
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
