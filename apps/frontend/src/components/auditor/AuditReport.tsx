import { Button } from "../ui/Button";

interface Vulnerability {
  level: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
}

// Temporary data until backend integration is complete
const MOCK_VULNERABILITIES: Vulnerability[] = [
  {
    level: "HIGH",
    title: "INDECISIÓN TECNOLÓGICA START-UP",
    description:
      "El sujeto cambia de framework cada 48 horas. Síntoma de procrastinación productiva.",
  },
  {
    level: "MEDIUM",
    title: "FALTA DE EVIDENCIA DE MERCADO",
    description:
      "El proyecto se basa en 'vibes' y no en datos. Probabilidad de fracaso: 88%.",
  },
  {
    level: "LOW",
    title: "EXCESO DE POLITICALLY CORRECT",
    description:
      "El lenguaje usado en los prompts es demasiado suave. Se requiere brutalidad.",
  },
];

export function AuditReport() {
  return (
    <div className="fixed inset-0 z-50 bg-[var(--wadi-bg)] flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="w-full max-w-2xl border-b border-[var(--wadi-alert)] pb-4 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-mono-wadi font-bold text-[var(--wadi-alert)] tracking-widest">
            REPORTE DE AUDITORÍA
          </h1>
          <p className="text-[var(--wadi-text-muted)] mt-2 font-mono-wadi text-xs">
            REF: {crypto.randomUUID().split("-")[0].toUpperCase()} // ESTADO:
            CRÍTICO
          </p>
        </div>
        <div className="text-right">
          <div className="text-[var(--wadi-alert)] font-mono-wadi text-xs uppercase animate-pulse">
            [RIESGO DE COLAPSO]
          </div>
          <div className="text-4xl font-bold text-white font-['Outfit']">
            88%
          </div>
        </div>
      </div>

      {/* VULNERABILITIES LIST */}
      <div className="w-full max-w-2xl space-y-4">
        {MOCK_VULNERABILITIES.map((vuln, idx) => (
          <div
            key={idx}
            className={`
                    border-l-4 p-4 bg-[var(--wadi-surface)] relative overflow-hidden group
                    ${vuln.level === "HIGH" ? "border-[var(--wadi-alert)]" : vuln.level === "MEDIUM" ? "border-orange-500" : "border-yellow-500"}
                `}
          >
            <div className="flex justify-between items-start mb-2">
              <span
                className={`
                        font-mono-wadi text-xs px-2 py-0.5 text-black font-bold
                        ${vuln.level === "HIGH" ? "bg-[var(--wadi-alert)]" : vuln.level === "MEDIUM" ? "bg-orange-500" : "bg-yellow-500"}
                    `}
              >
                {vuln.level}_RISK
              </span>
            </div>
            <h3 className="font-mono-wadi text-lg font-bold text-white mb-2 tracking-tight">
              {vuln.title}
            </h3>
            <p className="text-[var(--wadi-text-muted)] text-sm font-light leading-relaxed">
              {vuln.description}
            </p>

            {/* Scanline Effect on Hover */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
          </div>
        ))}
      </div>

      {/* ACTIONS */}
      <div className="w-full max-w-2xl mt-8 flex justify-end gap-4">
        <Button
          className="border border-[var(--wadi-text-muted)] text-[var(--wadi-text-muted)] hover:text-white"
          onClick={() => window.history.back()}
        >
          [IGNORAR REALIDAD]
        </Button>
        <Button
          className="bg-[var(--wadi-alert)] text-black hover:bg-[var(--wadi-alert)]/90 hover:shadow-[0_0_20px_var(--wadi-alert-glow)]"
          onClick={() => window.history.back()} // In future, this would trigger specific remediation
        >
          [ACEPTAR FALLOS]
        </Button>
      </div>
    </div>
  );
}
