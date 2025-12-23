import { Link } from "react-router-dom";
import { useChatStore } from "../../store/chatStore";
import { RefreshCw, Layers, Cpu, LayoutDashboard } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";

export function AuditorHeader() {
  const {
    aiModel,
    setAiModel,
    customSystemPrompt,
    workspaces,
    activeWorkspaceId,
    switchWorkspace,
  } = useChatStore();
  const isOnline = true;

  return (
    <header className="flex items-center justify-between p-4 border-b border-[var(--wadi-border)] bg-[var(--wadi-bg)]/95 backdrop-blur z-10 sticky top-0 h-[60px]">
      <div className="flex items-center gap-3">
        {/* WADI EYE LOGO SVG */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[var(--wadi-primary)] animate-pulse-soft"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path
            d="M12 2V4M12 20V22M2 12H4M20 12H22"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
        <div className="flex flex-col">
          <span className="font-mono-wadi text-xs font-bold leading-none tracking-wider text-white">
            WADI
          </span>
          <span className="text-[9px] text-[var(--wadi-success)] font-mono-wadi leading-none mt-1 tracking-widest">
            ESTADO: {isOnline ? "CONECTADO" : "OFFLINE"}
          </span>
          {customSystemPrompt && (
            <span className="text-[9px] text-[var(--wadi-tension)] font-mono-wadi leading-none mt-0.5 tracking-widest animate-pulse">
              [SYSTEM_OVERRIDE]
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        {/* DASHBOARD LINK */}
        <Tooltip content="Dashboard & Métricas">
          <Link
            to="/dashboard"
            className="hidden md:flex items-center justify-center p-1.5 text-[var(--wadi-text-muted)] hover:text-[var(--wadi-primary)] hover:bg-[var(--wadi-surface)] rounded transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-[var(--wadi-primary)] mr-1"
          >
            <LayoutDashboard size={14} />
          </Link>
        </Tooltip>

        {/* WORKSPACE SELECTOR */}
        <div className="hidden md:flex items-center mr-2 relative z-20">
          <Tooltip content="Cambiar contexto de trabajo">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-[var(--wadi-text-muted)]">
                <Layers size={10} />
              </div>
              <select
                value={activeWorkspaceId || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "__NEW__") {
                    // Handled via chat command for now
                  } else {
                    switchWorkspace(
                      workspaces.find((w) => w.id === val)?.name || ""
                    );
                  }
                }}
                className="bg-black/50 border border-[var(--wadi-border)] text-[var(--wadi-text)] text-[10px] pl-7 pr-6 py-1 rounded outline-none hover:border-[var(--wadi-primary)] focus:border-[var(--wadi-primary)] cursor-pointer appearance-none transition-colors w-[120px] truncate"
              >
                {workspaces.length === 0 && (
                  <option value="">(Sin Workspace)</option>
                )}
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-[var(--wadi-text-muted)]">
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </Tooltip>
        </div>

        {/* RESET BUTTON */}
        <Tooltip content="Reiniciar sistema (F5)">
          <button
            onClick={() => {
              if (
                confirm("¿Reiniciar sistemas y purgar memoria a corto plazo?")
              ) {
                window.location.reload();
              }
            }}
            className="p-1.5 text-[var(--wadi-text-muted)] hover:text-[var(--wadi-primary)] hover:bg-[var(--wadi-surface)] rounded transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-[var(--wadi-primary)]"
            title="Reiniciar Sistema"
            aria-label="Reiniciar sistema"
          >
            <RefreshCw size={14} />
          </button>
        </Tooltip>

        <div className="h-4 w-[1px] bg-[var(--wadi-border)] mx-1"></div>

        <span className="text-[10px] text-[var(--wadi-text-muted)] font-mono-wadi uppercase hidden sm:inline mr-1">
          MOTOR:
        </span>
        <Tooltip content="Modelo de IA">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-1.5 pointer-events-none text-[var(--wadi-text-muted)]">
              <Cpu size={10} />
            </div>
            <select
              value={aiModel}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setAiModel(e.target.value as "fast" | "deep")
              }
              className="bg-black/50 border border-[var(--wadi-border)] text-[var(--wadi-text)] text-[10px] font-mono-wadi p-1 pl-6 pr-2 rounded outline-none hover:border-[var(--wadi-primary)] focus:border-[var(--wadi-primary)] cursor-pointer appearance-none text-center min-w-[90px] transition-colors focus:ring-1 focus:ring-[var(--wadi-primary)]"
              style={{ textAlignLast: "center" }}
            >
              <option value="fast">RÁPIDO</option>
              <option value="deep">PROFUNDO</option>
            </select>
          </div>
        </Tooltip>
      </div>
    </header>
  );
}
