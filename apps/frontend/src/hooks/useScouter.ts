import { useCallback } from "react";

export type AudioContextState = "suspended" | "running" | "closed";

export function useScouter() {
  // WADI AUDIO PROTOCOL: SILENCE IS GOLDEN
  // Audio removed per auditor directive.

  const noOp = useCallback(() => {}, []);

  return {
    playScanSound: noOp,
    playAlertSound: noOp,
    initAmbientHum: noOp,
    setAmbientIntensity: noOp,
    playDeathSound: noOp,
    playCrystallizeSound: noOp,
    playYawnSound: noOp,
    audioState: "suspended" as AudioContextState,
  };
}
