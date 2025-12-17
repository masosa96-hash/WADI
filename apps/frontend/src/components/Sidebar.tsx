import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import { useEffect } from "react";
import { Button } from "./common/Button";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const {
    conversations,
    fetchConversations,
    loadConversation,
    resetChat,
    setSidebarOpen,
  } = useChatStore();

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  const handleNewChat = () => {
    resetChat();
    // Navigate to /chat to start fresh, or /chat/new if implementation requires
    navigate("/chat");
    onClose?.();
  };

  const handleHistoryClick = (id: string) => {
    loadConversation(id);
    navigate(`/chat/${id}`);
    onClose?.(); // Keep for robust fallback if needed
    setSidebarOpen(false); // Force close on mobile via store
  };

  return (
    <aside
      className={`sidebar-drawer ${isOpen ? "open" : ""} flex flex-col p-6 bg-[var(--color-surface)] border-r border-[var(--color-border)]`}
    >
      {/* 1. Botón Nuevo Chat (Acción Global) */}
      <div style={{ marginBottom: "2rem" }}>
        <Button
          fullWidth
          onClick={handleNewChat}
          style={{
            background: "var(--color-primary)",
            color: "#FFFFFF",
            fontWeight: 700,
            justifyContent: "center",
            padding: "0.8rem",
            boxShadow: "var(--shadow-y2k)",
          }}
        >
          + Nuevo Chat
        </Button>
      </div>

      {/* 2. Historial de Conversaciones */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <div
          style={{
            fontSize: "0.75rem",
            textTransform: "uppercase",
            color: "var(--color-text-soft)",
            marginBottom: "0.5rem",
            letterSpacing: "0.05em",
            fontWeight: 600,
          }}
        >
          Historial
        </div>

        {conversations && conversations.length > 0 ? (
          conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => handleHistoryClick(c.id)}
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                backgroundColor: location.pathname.includes(c.id)
                  ? "var(--color-surface-soft)"
                  : "transparent",
                color: location.pathname.includes(c.id)
                  ? "var(--color-text-main)"
                  : "var(--color-text-soft)",
                fontSize: "0.9rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                transition: "all 0.2s",
                fontWeight: location.pathname.includes(c.id) ? 600 : 400,
              }}
            >
              {c.title || "Sin título"}
            </div>
          ))
        ) : (
          <div
            style={{
              color: "var(--color-text-soft)",
              fontSize: "0.85rem",
              fontStyle: "italic",
              opacity: 0.7,
            }}
          >
            No hay charlas guardadas.
          </div>
        )}
      </div>

      {/* Footer Minimalista (Auth) */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: "1rem",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "0.8rem", color: "var(--color-text-soft)" }}>
          {user?.email}
        </div>
        <button
          onClick={() => signOut()}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "1.2rem",
            opacity: 0.5,
          }}
          title="Cerrar sesión"
        >
          ⏏️
        </button>
      </div>
    </aside>
  );
}
