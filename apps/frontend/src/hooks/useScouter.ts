import { useCallback } from "react";

// Singleton AudioContext to prevent mulitple instances
let globalAudioCtx: AudioContext | null = null;
let ambientOsc: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;

const getAudioContext = () => {
  if (!globalAudioCtx) {
    const Win = window as unknown as Window & {
      webkitAudioContext?: typeof AudioContext;
    };
    const Ctx = window.AudioContext || Win.webkitAudioContext;
    if (Ctx) {
      globalAudioCtx = new Ctx();
    }
  }
  return globalAudioCtx;
};

export function useScouter() {
  const initAmbientHum = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || ambientOsc) return; // Already running or no context

    // Resume context if suspended (browser policy)
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    try {
      // Brown/Low frequency hum
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // 60Hz hum with some modulation ideally, but simple sine/triangle low freq works
      osc.type = "sine";
      osc.frequency.value = 50; // Low rumble

      // Very low volume
      gain.gain.value = 0.02;

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      ambientOsc = osc;
      ambientGain = gain;
    } catch (e) {
      console.error("Ambient Audio Init Failed", e);
    }
  }, []);

  const setAmbientIntensity = useCallback((level: "normal" | "high") => {
    if (!ambientGain || !globalAudioCtx) return;
    const ctx = globalAudioCtx;
    const targetGain = level === "high" ? 0.02 * 1.5 : 0.02; // +50% (approx 20-50%)

    ambientGain.gain.cancelScheduledValues(ctx.currentTime);
    ambientGain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 1); // Smooth transition
  }, []);

  const playScanSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }, []);

  const playAlertSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(2500, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }, []);

  return { playScanSound, playAlertSound, initAmbientHum, setAmbientIntensity };
}
