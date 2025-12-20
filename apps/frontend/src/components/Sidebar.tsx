import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import { useEffect } from "react";
import { Button } from "./ui/Button";
import { LogItem } from "./ui/LogItem";
import { useScouter } from "../hooks/useScouter";
import { ShieldAlert } from "lucide-react";

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
    criminalRecord,
    fetchCriminalRecord,
  } = useChatStore();

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchCriminalRecord();
    }
  }, [user, fetchConversations, fetchCriminalRecord]);

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

  const { playScanSound } = useScouter();

  const handleReport = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    playScanSound();
    // Navigate to Audit View (mocked as a route for now, but UI asks for it)
    navigate(`/chat/${id}/audit`);
    onClose?.();
  };

  // ... existing handleDelete ...

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("¿Eliminar evidencia permanentemente?")) {
      await deleteConversation(id);
      if (location.pathname.includes(id)) {
        navigate("/chat");
      }
      fetchConversations();
    }
  };

  return (
    <aside
      className={`sidebar-drawer ${isOpen ? "open" : ""} flex flex-col p-0 border-r border-[var(--wadi-border)] bg-[var(--wadi-bg)] w-[280px] h-full sm:w-[320px]`}
    >
      {/* LOGO AREA */}
      <div className="p-6 border-b border-[var(--wadi-border)] flex items-center gap-3">
        <div className="w-3 h-3 bg-[var(--wadi-primary)] rounded-full animate-pulse-soft shadow-[0_0_10px_var(--wadi-primary)]"></div>
        <h1 className="font-mono-wadi text-xl font-bold tracking-tight text-white select-none">
          WADI{" "}
          <span className="text-[var(--wadi-text-muted)] text-xs font-normal align-top">
            OS v1.2
          </span>
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
        <div className="px-4 py-2 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] text-[var(--wadi-text-muted)] font-mono-wadi opacity-70">
          <span>Log de Evidencias</span>
          <div
            className={`flex items-center gap-1 cursor-help hover:text-[var(--wadi-alert)] transition-colors ${criminalRecord.riskCount > 5 ? "text-[var(--wadi-alert)] animate-pulse" : ""}`}
            title={
              criminalRecord.auditCount === 0
                ? "[EXPEDIENTE_LIMPIO: OK]"
                : `[AUDITORÍAS_PASADAS: ${criminalRecord.auditCount}] | [RIESGOS_CRÍTICOS: ${criminalRecord.riskCount}]`
            }
          >
            <ShieldAlert size={12} />
            <span>EXPEDIENTE</span>
          </div>
        </div>

        {conversations && conversations.length > 0 ? (
          conversations.map((c) => {
            const isActive = location.pathname.includes(c.id);
            // Format date YYYY-MM-DD
            const date = c.updated_at
              ? new Date(c.updated_at).toISOString().split("T")[0]
              : "UNKNOWN";

            return (
              <LogItem
                key={c.id}
                date={date}
                title={c.title || "REGISTRO_SIN_TITULO"}
                isActive={isActive}
                onClick={() => handleHistoryClick(c.id)}
                onReport={(e) => handleReport(e, c.id)}
                onDelete={(e) => handleDelete(e, c.id)}
              />
            );
          })
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
