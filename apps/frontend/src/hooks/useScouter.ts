import { useCallback } from "react";

export type AudioContextState = "suspended" | "running" | "closed";

export function useScouter() {
  // WADI AUDIO PROTOCOL: MONDAY'S REACTIONS
  // Using simple oscillators for diegetic feedback without external assets.

  const playTone = useCallback(
    (freq: number, type: OscillatorType, duration: number, rampTo?: number) => {
      try {
        const AudioContext =
          window.AudioContext ||
          (
            window as unknown as {
              webkitAudioContext: typeof window.AudioContext;
            }
          ).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        if (rampTo) {
          osc.frequency.exponentialRampToValueAtTime(
            rampTo,
            ctx.currentTime + duration
          );
        }

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.01,
          ctx.currentTime + duration
        );

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (e) {
        console.error("Audio error", e);
      }
    },
    []
  );

  const playScanSound = useCallback(() => {
    playTone(1200, "sine", 0.1); // Sonar Agudo (Éxito/Escaneo)
  }, [playTone]);

  const playAlertSound = useCallback(() => {
    playTone(400, "sawtooth", 0.3); // Sonar Grave (Alerta/Decisión)
  }, [playTone]);

  const playCrystallizeSound = useCallback(() => {
    playTone(1500, "sine", 0.05);
    setTimeout(() => playTone(1200, "sine", 0.2), 50);
  }, [playTone]);

  const playDeathSound = useCallback(() => {
    playTone(50, "square", 1, 10);
  }, [playTone]);

  const playYawnSound = useCallback(() => {
    playTone(300, "triangle", 0.8, 100);
  }, [playTone]);

  return {
    playScanSound,
    playAlertSound,
    playCrystallizeSound,
    playDeathSound,
    playYawnSound,
    initAmbientHum: useCallback(() => {}, []),
    setAmbientIntensity: useCallback(() => {}, []),
    audioState: "running" as AudioContextState,
  };
}
