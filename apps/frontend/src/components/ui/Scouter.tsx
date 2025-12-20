import { useRef, useEffect } from "react";
import { useChatStore } from "../../store/chatStore";
import { useScouter } from "../../hooks/useScouter";

export function Scouter() {
  const messages = useChatStore((state) => state.messages);
  const { playAlertSound, playScanSound } = useScouter();
  const prevMessagesLength = useRef(messages.length);

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
          // Visual flash is handled by Global Flash component or similar if needed,
          // but technically Scouter is the 'sensor'.
          // If we want a FULL visual scouter here, we could overlay a div.
          // However, keeping visual feedback separate (DecisionWall) is cleaner.
          // BUT, Scouter usually implies the "red tinted glasses" effect.
          // Let's implement the FLASH EFFECT here using DOM directly for maximum speed/independence

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
    <div
      id="scouter-flash-overlay"
      className="fixed inset-0 pointer-events-none z-[9999] bg-[var(--wadi-alert)] opacity-0 transition-opacity duration-75 mix-blend-overlay"
      aria-hidden="true"
    />
  );
}
