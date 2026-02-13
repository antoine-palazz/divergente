// ===== Faction Types =====

export type FactionSlug =
  | "audacieux"
  | "erudits"
  | "sinceres"
  | "fraternels"
  | "altruistes";

export interface Faction {
  slug: FactionSlug;
  name: string;
  subtitle: string;
  description: string;
  color: string;
  colorClass: string;
  bgClass: string;
  gameOrder: number;
}

// ===== Game Types =====

export type GameStatus = "locked" | "unlocked" | "completed";

export interface GameProgress {
  slug: FactionSlug;
  status: GameStatus;
  clueUnlocked: boolean;
}

// ===== Quiz Types (Erudits) =====

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

// ===== Statement Types (Sinceres) =====

export interface Statement {
  id: number;
  text: string;
  isTrue: boolean;
}

// ===== Puzzle Types (Altruistes) =====

export type CellType =
  | "empty"
  | "wall"
  | "start"
  | "goal"
  | "sacrifice" // costs extra move
  | "bonus"; // grants extra move

export interface PuzzleCell {
  type: CellType;
  x: number;
  y: number;
}

export interface PuzzleLevel {
  id: number;
  grid: CellType[][];
  maxMoves: number;
  startX: number;
  startY: number;
  goalX: number;
  goalY: number;
}

// ===== Clue Types =====

export interface Clue {
  slug: FactionSlug;
  crypticText: string;
  fragment: string;
  order: number;
}

// ===== Store Types =====

export interface GameState {
  completedGames: FactionSlug[];
  unlockedClues: Record<string, string>;
  isMuted: boolean;
  hasStarted: boolean;

  completeGame: (slug: FactionSlug) => void;
  unlockClue: (slug: FactionSlug, clue: string) => void;
  toggleMute: () => void;
  startGame: () => void;
  resetProgress: () => void;
  isGameUnlocked: (slug: FactionSlug) => boolean;
  isFinalUnlocked: () => boolean;
}

// ===== Sound Types =====

export type SoundEffect =
  | "success"
  | "failure"
  | "countdown"
  | "click"
  | "tension";
