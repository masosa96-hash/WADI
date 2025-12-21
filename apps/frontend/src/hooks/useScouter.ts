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

    // Sonido de "Pulso Vital" (Suave, como un latido digital)
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  }, []);

  const playAlertSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    // Alerta de "Desviación" (Menos 500 agresivo, más notificación de sonar)
    // 2500Hz -> 1200Hz (más suave)
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine"; // Sine es más suave que square
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }, []);

  const playDeathSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    // 1. White Noise Burst (Crash)
    const bufferSize = ctx.sampleRate * 2.5; // 2.5 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start();

    // 2. High Pitch Squeal (Hard Drive Spinning Down)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(8000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 2); // Spin down
    oscGain.gain.setValueAtTime(0.1, ctx.currentTime);
    oscGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start();
  }, []);

  return {
    playScanSound,
    playAlertSound,
    initAmbientHum,
    setAmbientIntensity,
    playDeathSound,
  };
}
