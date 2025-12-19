import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { API_URL } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { useScouter } from "../../hooks/useScouter";
import { supabase } from "../../config/supabase";

interface Vulnerability {
  level: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
}

export function AuditReport() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { playAlertSound } = useScouter();

  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId || !user) return; // Wait for user

    const fetchAudit = async () => {
      setIsLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) throw new Error("NO_AUTH_TOKEN");

        const res = await fetch(
          `${API_URL}/api/conversations/${conversationId}/audit`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("AUDIT_REFUSED_BY_SYSTEM");

        const jsonData = await res.json();
        setVulnerabilities(jsonData.vulnerabilities || []);

        // Auto-Block Check logic would go here via ChatStore in future steps
        // For now, we just display.
      } catch (err) {
        console.error(err);
        setError(
          "ERROR CRÍTICO: El auditor se niega a procesar este desastre."
        );
        playAlertSound();
      } finally {
        setIsLoading(false);
      }
    };

    fetchAudit();
  }, [conversationId, user, playAlertSound]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-[var(--wadi-bg)] flex flex-col items-center justify-center p-4">
        <div className="animate-pulse text-[var(--wadi-primary)] font-mono-wadi text-xl tracking-[0.3em] uppercase">
          [ESCANEANDO_INCONSISTENCIAS...]
        </div>
        {/* Detailed loader effect */}
        <div className="mt-4 w-64 h-1 bg-[var(--wadi-surface)] overflow-hidden">
          <div className="h-full bg-[var(--wadi-primary)] animate-[shimmer_1s_infinite] w-1/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4 border-4 border-[var(--wadi-alert)]">
        <h1 className="text-[var(--wadi-alert)] text-4xl font-bold font-mono-wadi mb-4">
          SYSTEM_FAILURE
        </h1>
        <p className="text-white font-mono-wadi">{error}</p>
        <Button
          onClick={() => navigate(-1)}
          className="mt-8 bg-[var(--wadi-alert)] text-black hover:bg-white"
        >
          [RETIRADA TÁCTICA]
        </Button>
      </div>
    );
  }

  const highRiskCount = vulnerabilities.filter(
    (v) => v.level === "HIGH"
  ).length;
  const riskPercentage = Math.min(
    100,
    vulnerabilities.length * 20 + highRiskCount * 15
  );

  return (
    <div className="fixed inset-0 z-50 bg-[var(--wadi-bg)] flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="w-full max-w-2xl border-b border-[var(--wadi-alert)] pb-4 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-mono-wadi font-bold text-[var(--wadi-alert)] tracking-widest">
            REPORTE DE AUDITORÍA
          </h1>
          <p className="text-[var(--wadi-text-muted)] mt-2 font-mono-wadi text-xs uppercase">
            REF: {conversationId?.split("-")[0]} // ESTADO:{" "}
            {highRiskCount > 0 ? "CRÍTICO" : "ESTABLE"}
          </p>
        </div>
        <div className="text-right">
          {highRiskCount > 2 && (
            <div className="text-[var(--wadi-alert)] font-mono-wadi text-xs uppercase animate-pulse mb-1">
              [RIESGO DE COLAPSO]
            </div>
          )}
          <div className="text-4xl font-bold text-white font-['Outfit']">
            {riskPercentage}%
          </div>
        </div>
      </div>

      {/* VULNERABILITIES LIST */}
      <div className="w-full max-w-2xl space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {vulnerabilities.length === 0 ? (
          <div className="text-center py-12 text-[var(--wadi-text-muted)] font-mono-wadi border border-dashed border-[var(--wadi-border)]">
            [NO SE DETECTARON FALLOS ESTRUCTURALES... POR AHORA]
          </div>
        ) : (
          vulnerabilities.map((vuln, idx) => (
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
          ))
        )}
      </div>

      {/* ACTIONS */}
      <div className="w-full max-w-2xl mt-8 flex justify-end gap-4">
        <Button
          className="border border-[var(--wadi-text-muted)] text-[var(--wadi-text-muted)] hover:text-white"
          onClick={() => navigate(-1)}
        >
          [IGNORAR REALIDAD]
        </Button>
        <Button
          className="bg-[var(--wadi-alert)] text-black hover:bg-[var(--wadi-alert)]/90 hover:shadow-[0_0_20px_var(--wadi-alert-glow)]"
          onClick={() => {
            // In future: Trigger FORCE_DECISION in chat
            navigate(-1);
          }}
        >
          [ACEPTAR FALLOS]
        </Button>
      </div>
    </div>
  );
}
