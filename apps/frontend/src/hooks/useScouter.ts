import { useCallback, useState, useEffect } from "react";

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
  const [audioState, setAudioState] = useState<AudioContextState>("suspended");

  useEffect(() => {
    const ctx = getAudioContext();
    if (ctx) {
      const updateState = () => setAudioState(ctx.state);
      updateState();
      ctx.addEventListener("statechange", updateState);

      // Global interaction listener to unlock audio on first interaction
      const unlockAudio = () => {
        // Prevent multiple calls/logs if multiple events trigger quickly
        if (ctx.state === "running") {
          // Already unlocked, just cleanup and return
          window.removeEventListener("click", unlockAudio);
          window.removeEventListener("keydown", unlockAudio);
          window.removeEventListener("touchstart", unlockAudio);
          window.removeEventListener("mousedown", unlockAudio);
          return;
        }

        if (ctx.state === "suspended") {
          ctx
            .resume()
            .then(() => {
              // Play "Systems Initiated" sound (Ascending Beep)
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = "sine";
              osc.frequency.setValueAtTime(220, ctx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(
                880,
                ctx.currentTime + 0.3
              );

              gain.gain.setValueAtTime(0.01, ctx.currentTime);
              gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
              gain.gain.exponentialRampToValueAtTime(
                0.001,
                ctx.currentTime + 0.3
              );

              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.35);

              // Log removed as per request
            })
            .catch(() => {
              // Silent fail if unlock fails, don't spam console.
            })
            .finally(() => {
              // Ensure removal happens after attempt, successful or not
              window.removeEventListener("click", unlockAudio);
              window.removeEventListener("keydown", unlockAudio);
              window.removeEventListener("touchstart", unlockAudio);
              window.removeEventListener("mousedown", unlockAudio);
            });
        }
      };

      window.addEventListener("click", unlockAudio);
      window.addEventListener("keydown", unlockAudio);
      window.addEventListener("touchstart", unlockAudio);
      window.addEventListener("mousedown", unlockAudio);

      return () => {
        ctx.removeEventListener("statechange", updateState);
        window.removeEventListener("click", unlockAudio);
        window.removeEventListener("keydown", unlockAudio);
        window.removeEventListener("touchstart", unlockAudio);
        window.removeEventListener("mousedown", unlockAudio);
      };
    }
  }, []);

  const initAmbientHum = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || ambientOsc) return; // Already running or no context

    // Resume context if suspended (browser policy)
    // NOTE: If suspended, simple resume might fail without user gesture.
    // relying on global unlockAudio to handle the resume properly.
    if (ctx.state === "suspended") {
      return; // Wait for user interaction to unlock properly.
    }

    try {
      // Brown/Low frequency hum
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Filter to cut ultra-lows and add some "air"
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 60; // Cut sub-rumble below 60Hz

      // 60Hz hum with some modulation ideally, but simple sine/triangle low freq works
      osc.type = "sine";
      osc.frequency.value = 50; // Low rumble

      // Increased base volume (+20% from 0.02 -> 0.024)
      gain.gain.value = 0.024;

      osc.connect(filter);
      filter.connect(gain);
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
    const targetGain = level === "high" ? 0.024 * 1.5 : 0.024; // +50%

    ambientGain.gain.cancelScheduledValues(ctx.currentTime);
    ambientGain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 1); // Smooth transition
  }, []);

  const createReverbNode = (ctx: AudioContext, duration: number = 2) => {
    const convolver = ctx.createConvolver();
    const rate = ctx.sampleRate;
    const length = rate * duration;
    const impulse = ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      // Simple noise impulse decay
      const decay = Math.pow(1 - i / length, 2);
      left[i] = (Math.random() * 2 - 1) * decay;
      right[i] = (Math.random() * 2 - 1) * decay;
    }
    convolver.buffer = impulse;
    return convolver;
  };

  const playScanSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    // Sonido de "Pulso Vital" (Suave, como un latido digital)
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Add Reverb for "Spatial" feel
    const reverb = createReverbNode(ctx, 0.5); // Short reverb 0.5s
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.4; // Wet mix

    osc.type = "sine";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Send to reverb also
    gainNode.connect(reverb);
    reverb.connect(reverbGain);
    reverbGain.connect(ctx.destination);

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

  const playCrystallizeSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    // Metallic Ping (Glass/Metal)
    // 2 high sine waves slightly detuned
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.frequency.value = 2000;
    osc2.frequency.value = 3500; // Harmony

    // Quick envelope
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 1.5);
    osc2.stop(ctx.currentTime + 1.5);
  }, []);

  const playYawnSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    // Electronic Yawn / Bostezo Digital
    // Pitch drop oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    // Slow drop
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 1.5);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.5);
  }, []);

  return {
    playScanSound,
    playAlertSound,
    initAmbientHum,
    setAmbientIntensity,
    playDeathSound,
    playCrystallizeSound,
    playYawnSound,
    audioState, // Expose audio state for UI indicators
  };
}
