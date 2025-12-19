import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import { useEffect } from "react";
import { Button } from "./ui/Button";

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
    deleteConversation, 
  } = useChatStore();

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  const handleNewChat = () => {
    resetChat();
    navigate("/chat");
    onClose?.();
  };

  const handleHistoryClick = (id: string) => {
    loadConversation(id);
    navigate(`/chat/${id}`);
    onClose?.(); 
    setSidebarOpen(false); 
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(confirm("¿Eliminar evidencia permanentemente?")) {
        await deleteConversation(id);
        if(location.pathname.includes(id)) {
            navigate("/chat");
        }
        fetchConversations();
    }
  }

  return (
    <aside
      className={`sidebar-drawer ${isOpen ? "open" : ""} flex flex-col p-0 border-r border-[var(--wadi-border)] bg-[var(--wadi-bg)] w-[280px] h-full sm:w-[320px]`}
    >
        {/* LOGO AREA */}
        <div className="p-6 border-b border-[var(--wadi-border)] flex items-center gap-3">
            <div className="w-3 h-3 bg-[var(--wadi-primary)] rounded-full animate-pulse-soft shadow-[0_0_10px_var(--wadi-primary)]"></div>
            <h1 className="font-mono-wadi text-xl font-bold tracking-tight text-white select-none">
                WADI <span className="text-[var(--wadi-text-muted)] text-xs font-normal align-top">OS v1.2</span>
            </h1>
        </div>

      {/* 1. Botón Nuevo Chat (Acción Global) */}
      <div className="p-4">
        <Button
          onClick={handleNewChat}
          variant="default"
          className="w-full justify-start gap-2 font-mono-wadi tracking-widest text-xs"
        >
          <span className="text-lg leading-none">+</span> INICIAR PROTOCOLO
        </Button>
      </div>

      {/* 2. Historial de Conversaciones (LOGS) */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        <div className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[var(--wadi-text-muted)] font-mono-wadi opacity-70">
            Log de Evidencias
        </div>

        {conversations && conversations.length > 0 ? (
          conversations.map((c) => {
            const isActive = location.pathname.includes(c.id);
            // Format date YYYY-MM-DD
            const date = c.updated_at ? new Date(c.updated_at).toISOString().split('T')[0] : 'UNKNOWN';
            
            return (
            <div
              key={c.id}
              onClick={() => handleHistoryClick(c.id)}
              className={`
                group relative flex items-center justify-between
                px-4 py-3 cursor-pointer transition-all duration-200
                border-l-2
                ${isActive 
                    ? "bg-[var(--wadi-surface)] border-[var(--wadi-primary)] text-[var(--wadi-text)]" 
                    : "border-transparent text-[var(--wadi-text-muted)] hover:bg-[var(--wadi-surface)] hover:text-[var(--wadi-text)] hover:border-[var(--wadi-border)]"
                }
              `}
            >
              <div className="flex flex-col gap-0.5 overflow-hidden font-mono-wadi">
                <span className="text-[10px] opacity-60">[{date}]</span>
                <span className="truncate text-xs font-medium w-full">{c.title || "REGISTRO_SIN_TITULO"}</span>
              </div>
              
              {/* Delete Button (Hover Only) */}
              <button 
                onClick={(e) => handleDelete(e, c.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:text-[var(--wadi-alert)]"
                title="Borrar Evidencia"
              >
                ✕
              </button>
            </div>
          )})
        ) : (
            <div className="px-4 py-8 text-center text-[var(--wadi-text-muted)] text-xs font-mono-wadi border border-dashed border-[var(--wadi-border)] m-2 bg-[var(--wadi-surface)]/30">
                [NO HAY REGISTROS]
            </div>
        )}
      </div>

      {/* Footer Minimalista (Auth) */}
        <div className="p-4 border-t border-[var(--wadi-border)] bg-[var(--wadi-bg)]">
            <div className="flex items-center justify-between text-xs text-[var(--wadi-text-muted)] font-mono-wadi">
                <span className="truncate max-w-[150px]">{user?.email}</span>
                <button
                    onClick={() => signOut()}
                    className="hover:text-[var(--wadi-alert)] transition-colors uppercase tracking-wider"
                >
                    [SALIR]
                </button>
            </div>
        </div>
    </aside>
  );
}
