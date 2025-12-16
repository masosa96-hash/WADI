import { useState, useEffect } from "react";

export type WadiMood = "hostile" | "mildly_disappointed" | "training_wheels";

interface WadiOnboardingProps {
  mood?: WadiMood;
}

export default function WadiOnboarding({
  mood = "hostile",
}: WadiOnboardingProps) {
  const [step, setStep] = useState(0);

  const messagesByMood: Record<WadiMood, string[]> = {
    hostile: [
      "*⌛ Generando entorno mental...*",
      "🧠 WADI ha despertado.",
      "No va a hacerte sentir mejor,",
      "pero va a hacer que tomes decisiones.",
      "➡️ Elegí tu camino,",
      "🌀 o sentate en el rincón del caos.",
    ],
    mildly_disappointed: [
      "*⌛ WADI está despertando de su siesta funcional...*",
      "🧠 WADI activo.",
      "Esto puede doler menos si cooperás.",
      "Tomemos una decisión antes de que vuelva la confusión.",
      "📌 ¿Por dónde empezamos?",
      "📉 O seguí divagando, pero sin mí.",
    ],
    training_wheels: [
      "*⌛ Preparando el espacio para ordenar tus ideas...*",
      "🧠 Hola, soy WADI.",
      "Estoy acá para ayudarte a decidir sin drama.",
      "Podemos ir paso a paso, sin presión.",
      "🗺️ Empezamos cuando quieras.",
      "☕ O tomamos un respiro y seguimos después.",
    ],
  };

  const messages = messagesByMood[mood] || messagesByMood.hostile;

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
        maxWidth: "32rem",
        margin: "2.5rem auto 0",
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
