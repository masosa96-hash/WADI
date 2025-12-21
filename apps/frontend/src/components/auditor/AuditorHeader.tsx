export function AuditorHeader() {
  // Fake status, or derive from connection
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

      {/* Optional: Current Context/Project Info could go here */}
    </header>
  );
}
