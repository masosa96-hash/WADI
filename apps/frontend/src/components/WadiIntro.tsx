import { useState, useEffect } from "react";

export default function WadiIntro() {
  const [step, setStep] = useState(0);

  const messages = [
    "*⌛ Generando entorno mental...*",
    "🧠 WADI ha despertado.",
    "No va a hacerte sentir mejor,",
    "pero va a hacer que tomes decisiones.",
    "➡️ Elegí tu camino,",
    "🌀 o sentate en el rincón del caos.",
  ];

  useEffect(() => {
    if (step < messages.length - 1) {
      const timer = setTimeout(() => setStep(step + 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div
      style={{
        whiteSpace: "pre-wrap",
        fontFamily: "monospace",
        fontSize: "0.875rem",
        lineHeight: "1.625",
        padding: "1rem",
        borderRadius: "0.75rem",
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        maxWidth: "28rem",
        margin: "0 auto",
        color: "var(--color-text-main)",
      }}
    >
      {messages.slice(0, step + 1).map((line, index) => (
        <p
          key={index}
          style={{
            marginBottom: "0.25rem",
            color: index === 0 ? "var(--color-text-soft)" : "inherit",
          }}
        >
          {index === 0 ? (
            <span className="animate-pulse">{line}</span>
          ) : index === 1 ? (
            <strong>{line}</strong>
          ) : (
            line
          )}
        </p>
      ))}
    </div>
  );
}
