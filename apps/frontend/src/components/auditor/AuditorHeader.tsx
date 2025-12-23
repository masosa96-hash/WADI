import React from "react";
import { useChatStore } from "../../store/chatStore";
import { RefreshCw } from "lucide-react";

export function AuditorHeader() {
  const { aiModel, setAiModel } = useChatStore();
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
        </div>
      </div>

      {/* Model Selector & Reset */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            if (
              confirm("¿Reiniciar sistemas y purgar memoria a corto plazo?")
            ) {
              window.location.reload(); // Simple hard reset for now or use resetChat()
            }
          }}
          className="p-1.5 text-[var(--wadi-text-muted)] hover:text-[var(--wadi-primary)] hover:rotate-180 transition-all duration-500"
          title="Reiniciar Sistema"
        >
          <RefreshCw size={14} />
        </button>

        <span className="text-[10px] text-[var(--wadi-text-muted)] font-mono-wadi uppercase hidden sm:inline">
          MOTOR:
        </span>
        <select
          value={aiModel}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setAiModel(e.target.value as "fast" | "deep")
          }
          className="bg-[black] border border-[var(--wadi-border)] text-[var(--wadi-text)] text-[10px] font-mono-wadi p-1 px-2 rounded outline-none hover:border-[var(--wadi-primary)] focus:border-[var(--wadi-primary)] cursor-pointer appearance-none text-center min-w-[80px]"
          style={{ textAlignLast: "center" }}
        >
          <option value="fast">RÁPIDO</option>
          <option value="deep">PROFUNDO</option>
        </select>
      </div>
    </header>
  );
}
