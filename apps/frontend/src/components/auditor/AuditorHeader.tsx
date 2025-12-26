import { Link } from "react-router-dom";
import { useChatStore } from "../../store/chatStore";
import { RefreshCw, Layers, Cpu, LayoutDashboard } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";

export function AuditorHeader() {
  const { aiModel, setAiModel, customSystemPrompt } = useChatStore();
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
          <span className="font-bold text-sm leading-none tracking-tight text-[var(--wadi-text)]">
            MONDAY
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
      </div>
    </header>
  );
}
