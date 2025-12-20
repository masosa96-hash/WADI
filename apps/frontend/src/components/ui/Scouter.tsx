import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../../store/chatStore";
import { useScouter } from "../../hooks/useScouter";

interface ScouterProps {
  isDecisionBlocked?: boolean;
}

export function Scouter({ isDecisionBlocked = false }: ScouterProps) {
  const messages = useChatStore((state) => state.messages);
  const rank = useChatStore((state) => state.rank);
  const systemDeath = useChatStore((state) => state.systemDeath);
  const resetChat = useChatStore((state) => state.resetChat);
  const navigate = useNavigate();

  const { playAlertSound, playScanSound, initAmbientHum, setAmbientIntensity } =
    useScouter();
  const prevMessagesLength = useRef(messages.length);
  const prevRank = useRef(rank);

  // Initialize Ambient Hum on Mount (will technically wait for user interaction to be audible)
  useEffect(() => {
    const handleInteraction = () => initAmbientHum();
    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [initAmbientHum]);

  // Adjust Ambient Intensity based on Decision Block or System Death
  useEffect(() => {
    if (systemDeath) {
      setAmbientIntensity("high"); // Max tension
      return;
    }
    setAmbientIntensity(isDecisionBlocked ? "high" : "normal");
  }, [isDecisionBlocked, systemDeath, setAmbientIntensity]);

  // System Death Visual Loop & Redirect
  useEffect(() => {
    if (systemDeath) {
      const overlay = document.getElementById("scouter-flash-overlay");
      let active = true;
      const loop = () => {
        if (!active || !overlay) return;
        overlay.style.opacity = Math.random() > 0.5 ? "0.8" : "0.2";
        setTimeout(loop, 100);
      };
      loop();

      // Redirect after 10s
      const timer = setTimeout(() => {
        resetChat(); // Clear state completely
        // Also need to clear systemDeath flag so we don't loop forever if we come back?
        // Actually resetChat clears conversationId etc, but maybe not systemDeath.
        // We should ensure systemDeath is false after reset.
        useChatStore.setState({
          systemDeath: false,
          rank: "GENERADOR_DE_HUMO",
          points: 0,
        });
        navigate("/");
      }, 10000);

      return () => {
        active = false;
        clearTimeout(timer);
        if (overlay) overlay.style.opacity = "0";
      };
    }
  }, [systemDeath, navigate, resetChat]);

  // Rank Change Logic
  useEffect(() => {
    if (prevRank.current !== rank) {
      // Rank Updated
      // Play harmonic scan sound (re-use scan sound or create new one if needed)
      playScanSound();
      // Lavender Flash
      const overlay = document.getElementById("scouter-flash-overlay");
      if (overlay) {
        overlay.style.backgroundColor = "var(--wadi-primary)";
        overlay.style.opacity = "0.5";
        setTimeout(() => {
          overlay.style.opacity = "0";
          overlay.style.backgroundColor = "var(--wadi-alert)"; // Reset to red for alerts
        }, 1000);
      }
    }
    prevRank.current = rank;
  }, [rank, playScanSound]);

  useEffect(() => {
    const newCount = messages.length;
    const oldCount = prevMessagesLength.current;

    if (newCount > oldCount) {
      const lastMsg = messages[newCount - 1];
      const isMyMessage = lastMsg.role === "user";

      // SCOUTER LOGIC: Check for alerts in Assistant messages
      if (!isMyMessage) {
        const text = lastMsg.content || "";
        const isChaotic = text.includes("[ALERTA DE CAOS DETECTADA]");
        const isForcedDecision = text.includes("[FORCE_DECISION]");
        const isRejected = text.toLowerCase().includes("tostadora");
        const isNormalAnalysis =
          text.includes("Analizar inconsistencias") ||
          text.includes("Diagnóstico") ||
          text.includes("[DECONSTRUCT_START]");

        if (isChaotic || isRejected || isForcedDecision) {
          playAlertSound();
          const flashOverlay = document.getElementById("scouter-flash-overlay");
          if (flashOverlay) {
            flashOverlay.style.opacity = "1";
            setTimeout(
              () => {
                flashOverlay.style.opacity = "0";
              },
              isForcedDecision ? 800 : 200
            );
          }
        } else if (
          isNormalAnalysis ||
          text.toLowerCase().includes("antecedente")
        ) {
          playScanSound();
        }
      }
    }
    prevMessagesLength.current = newCount;
  }, [messages, playAlertSound, playScanSound]);

  return (
    <>
      <div
        id="scouter-flash-overlay"
        className="fixed inset-0 pointer-events-none z-[9999] bg-[var(--wadi-alert)] opacity-0 transition-opacity duration-75 mix-blend-overlay"
        aria-hidden="true"
      />

      {/* GLITCH OVERLAY FOR SYSTEM DEATH */}
      {systemDeath && (
        <div className="fixed inset-0 z-[10000] pointer-events-auto bg-black/50 flex items-center justify-center overflow-hidden">
          <div className="text-[var(--wadi-alert)] font-bold text-4xl animate-pulse font-mono-wadi tracking-widest text-center">
            SYSTEM FAILURE
            <br />
            PROTOCOL_DEATH_INITIATED
            <br />
            <span className="text-sm text-white mt-4 block">
              Reiniciando núcleos...
            </span>
          </div>
          {/* CSS Glitch lines would go here, simulated by flash loop above for now */}
        </div>
      )}
    </>
  );
}
