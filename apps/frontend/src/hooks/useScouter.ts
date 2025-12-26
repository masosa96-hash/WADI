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

  return {
    playScanSound: useCallback(() => playTone(800, "sine", 0.15), [playTone]), // Standard Scan

    // Check de Lucidez / Amber Alert: Low Sonar Ping
    playAlertSound: useCallback(
      () => playTone(400, "sawtooth", 0.4), // Low warning
      [playTone]
    ),

    initAmbientHum: useCallback(() => {}, []),
    setAmbientIntensity: useCallback(() => {}, []),

    playDeathSound: useCallback(
      () => playTone(50, "square", 1, 10),
      [playTone]
    ), // Slide down

    // Crystallize / Success: High Sonar Ping (Lavender)
    playCrystallizeSound: useCallback(
      () => playTone(1200, "sine", 0.6), // Pure high tone
      [playTone]
    ),

    // Scorn / Yawn: Low descending slide
    playYawnSound: useCallback(() => {
      playTone(300, "triangle", 0.8, 100);
    }, [playTone]),

    audioState: "running" as AudioContextState,
  };
}
