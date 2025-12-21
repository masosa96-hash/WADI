interface DecisionWallProps {
  messageContent?: string;
}

export function DecisionWall({ messageContent }: DecisionWallProps) {
  return (
    <div className="fixed inset-0 z-40 bg-[var(--wadi-bg)]/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-500 p-4">
      {/* Estética cambiada: De rojo alerta a Lavanda/Calma */}
      <div className="max-w-xl w-full border border-[var(--wadi-primary)]/50 bg-[#0f111a] shadow-[0_0_80px_rgba(139,92,246,0.15)] relative overflow-hidden rounded-sm">
        {/* Soft Ambient Light */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--wadi-primary)]/5 to-transparent h-full w-full pointer-events-none"></div>

        <div className="p-10 flex flex-col gap-6 relative z-10 text-center">
          <div className="text-[var(--wadi-primary)] font-mono-wadi text-[10px] tracking-[0.4em] uppercase opacity-70">
            [SISTEMA DE ENFOQUE]
          </div>

          <h1 className="text-3xl font-light font-['Outfit'] text-white tracking-widest uppercase">
            Pausa de Lucidez
          </h1>

          <div className="w-16 h-px bg-[var(--wadi-primary)]/50 mx-auto my-2"></div>

          {messageContent && (
            <div className="font-mono-wadi text-sm text-[var(--wadi-text-muted)] whitespace-pre-wrap leading-relaxed px-4 py-2 opacity-90">
              {messageContent
                .replace(/\[FORCE_DECISION\]/g, "")
                .replace(/\[CHECK_DE_LUCIDEZ\]/g, "")}
            </div>
          )}

          <p className="text-[var(--wadi-primary)] text-xs font-mono-wadi tracking-widest mt-8 animate-pulse">
            ELEGÍ UNA OPCIÓN (A/B) PARA AVANZAR
          </p>
        </div>
      </div>
    </div>
  );
}
