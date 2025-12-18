import { useCallback, useRef } from "react";

export function useScouter() {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Lazy initialize audio context
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      // Use standard AudioContext (Safari requires webkit prefix but modern React/Vite targets modern browsers mostly; keep simple)
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (Ctx) {
        audioContextRef.current = new Ctx();
      }
    }
    return audioContextRef.current;
  };

  const playScanSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Create oscillator for the "Scouter" scanning sound (high pitch electronic chirps)
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);

    // Add volume envelope
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

    // Create a more aggressive "Error/Alert" buzzer
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(150, ctx.currentTime); // Low buzz
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }, []);

  return { playScanSound, playAlertSound };
}
