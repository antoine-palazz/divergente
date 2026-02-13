"use client";

import { useCallback } from "react";
import { useGameStore } from "@/store/gameStore";
import { soundManager } from "@/utils/sound";
import { SoundEffect } from "@/types";

export function useSound() {
  const isMuted = useGameStore((s) => s.isMuted);

  const play = useCallback(
    (effect: SoundEffect) => {
      soundManager.setMuted(isMuted);
      soundManager.play(effect);
    },
    [isMuted]
  );

  return { play, isMuted };
}
