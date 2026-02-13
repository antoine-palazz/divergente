import { create } from "zustand";
import { GameState, FactionSlug } from "@/types";
import { GAME_ORDER } from "@/data/factions";
import { saveProgress, loadProgress, clearProgress } from "@/utils/storage";

export const useGameStore = create<GameState>((set, get) => ({
  completedGames: [],
  unlockedClues: {},
  isMuted: false,
  hasStarted: false,

  completeGame: (slug: FactionSlug) => {
    const state = get();
    if (state.completedGames.includes(slug)) return;
    const newCompleted = [...state.completedGames, slug];
    set({ completedGames: newCompleted });
    saveProgress({
      completedGames: newCompleted,
      unlockedClues: state.unlockedClues,
      isMuted: state.isMuted,
      hasStarted: state.hasStarted,
    });
  },

  unlockClue: (slug: FactionSlug, clue: string) => {
    const state = get();
    const newClues = { ...state.unlockedClues, [slug]: clue };
    set({ unlockedClues: newClues });
    saveProgress({
      completedGames: state.completedGames,
      unlockedClues: newClues,
      isMuted: state.isMuted,
      hasStarted: state.hasStarted,
    });
  },

  toggleMute: () => {
    const state = get();
    const newMuted = !state.isMuted;
    set({ isMuted: newMuted });
    saveProgress({
      completedGames: state.completedGames,
      unlockedClues: state.unlockedClues,
      isMuted: newMuted,
      hasStarted: state.hasStarted,
    });
  },

  startGame: () => {
    set({ hasStarted: true });
    const state = get();
    saveProgress({
      completedGames: state.completedGames,
      unlockedClues: state.unlockedClues,
      isMuted: state.isMuted,
      hasStarted: true,
    });
  },

  resetProgress: () => {
    clearProgress();
    set({
      completedGames: [],
      unlockedClues: {},
      isMuted: false,
      hasStarted: false,
    });
  },

  isGameUnlocked: (slug: FactionSlug) => {
    const state = get();
    if (!state.hasStarted) return false;
    const index = GAME_ORDER.indexOf(slug);
    if (index === 0) return true;
    const previousSlug = GAME_ORDER[index - 1] as FactionSlug;
    return state.completedGames.includes(previousSlug);
  },

  isFinalUnlocked: () => {
    const state = get();
    return GAME_ORDER.every((slug) =>
      state.completedGames.includes(slug as FactionSlug)
    );
  },
}));

// Hydrate store from localStorage on client side
export function hydrateStore() {
  const saved = loadProgress();
  if (saved) {
    useGameStore.setState({
      completedGames: saved.completedGames as FactionSlug[],
      unlockedClues: saved.unlockedClues,
      isMuted: saved.isMuted,
      hasStarted: saved.hasStarted,
    });
  }
}
