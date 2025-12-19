export function DecisionWall() {
  return (
    <div className="fixed inset-0 z-40 bg-[var(--wadi-bg)]/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
      <div className="max-w-md w-full p-1 border-t-2 border-b-2 border-[var(--wadi-alert)] bg-black/90">
        <div className="p-8 text-center flex flex-col gap-4">
          <div className="text-[var(--wadi-alert)] font-mono-wadi text-xs tracking-[0.5em] animate-pulse">
            SISTEMA DE BLOQUEO ACTIVO
          </div>
          <h1 className="text-3xl font-bold font-mono-wadi text-white tracking-widest break-words">
            DECISIÓN
            <br />
            REQUERIDA
          </h1>
          <div className="w-full h-px bg-[var(--wadi-alert)]/30 my-2"></div>
          <p className="text-[var(--wadi-text-muted)] text-sm font-light">
            El sistema ha detectado una bifurcación crítica. No se permite el
            avance sin una selección explícita.
          </p>
        </div>
      </div>
    </div>
  );
}
