interface DecisionWallProps {
  messageContent?: string;
}

export function DecisionWall({ messageContent }: DecisionWallProps) {
  // Simple extraction of potential options if they exist, purely visual highlight
  // We look for patterns like "A)" or "1." at start of lines inside the message

  return (
    <div className="fixed inset-0 z-40 bg-[var(--wadi-bg)]/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300 p-4">
      <div className="max-w-xl w-full border-2 border-[var(--wadi-alert)] bg-black shadow-[0_0_50px_rgba(255,0,60,0.2)] relative overflow-hidden">
        {/* Animated Scanline */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--wadi-alert)]/10 to-transparent h-[10px] w-full animate-scan pointer-events-none"></div>

        <div className="p-8 flex flex-col gap-6 relative z-10">
          <div className="text-[var(--wadi-alert)] font-mono-wadi text-xs tracking-[0.5em] animate-pulse text-center">
            SISTEMA DE BLOQUEO ACTIVO
          </div>

          <h1 className="text-4xl font-bold font-mono-wadi text-white tracking-widest text-center">
            DECISIÓN
            <br />
            REQUERIDA
          </h1>

          <div className="w-full h-px bg-[var(--wadi-alert)]/30"></div>

          {messageContent && (
            <div className="font-mono-wadi text-sm text-[var(--wadi-text-muted)] whitespace-pre-wrap leading-relaxed border-l-2 border-[var(--wadi-alert)] pl-4 py-2 bg-[var(--wadi-alert)]/5">
              {messageContent.replace(/\[FORCE_DECISION\]/g, "")}
            </div>
          )}

          <p className="text-[var(--wadi-alert)] text-xs font-bold text-center mt-4">
            SELECCIONÁ UNA OPCIÓN (A/B) EN EL CHAT PARA CONTINUAR
          </p>
        </div>
      </div>
    </div>
  );
}
