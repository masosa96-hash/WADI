import { useCallback } from "react";

export type AudioContextState = "suspended" | "running" | "closed";

export function useScouter() {
  // WADI AUDIO PROTOCOL: MONDAY'S REACTIONS
  // Using simple oscillators for diegetic feedback without external assets.

  const playTone = useCallback(
    (freq: number, type: OscillatorType, duration: number) => {
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

  return {
    playScanSound: useCallback(() => playTone(800, "sine", 0.1), [playTone]), // File upload
    playAlertSound: useCallback(
      () => playTone(150, "sawtooth", 0.3),
      [playTone]
    ), // Check de Lucidez (Error)
    initAmbientHum: useCallback(() => {}, []),
    setAmbientIntensity: useCallback(() => {}, []),
    playDeathSound: useCallback(() => playTone(50, "square", 1), [playTone]),
    playCrystallizeSound: useCallback(
      () => playTone(1200, "triangle", 0.5),
      [playTone]
    ), // Success
    playYawnSound: useCallback(() => {}, []),
    audioState: "running" as AudioContextState,
  };
}
