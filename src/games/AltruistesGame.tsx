"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { useSound } from "@/hooks/useSound";
import { getFaction } from "@/data/factions";
import { PUZZLE_LEVELS } from "@/data/puzzleLevels";
import { CellType } from "@/types";
import Button from "@/components/ui/Button";
import ScoreDisplay from "@/components/ui/ScoreDisplay";

type GamePhase = "intro" | "playing" | "won" | "lost";

interface PlayerState {
  x: number;
  y: number;
  movesLeft: number;
}

const CELL_COLORS: Record<CellType, { bg: string; border: string; label: string }> = {
  empty: { bg: "#1e1e2e", border: "#2a2a3e", label: "" },
  wall: { bg: "#0a0a0f", border: "#1a1a2a", label: "▪" },
  start: { bg: "#4a9eff22", border: "#4a9eff44", label: "S" },
  goal: { bg: "#10b98122", border: "#10b98144", label: "★" },
  sacrifice: { bg: "#dc262622", border: "#dc262644", label: "−1" },
  bonus: { bg: "#f59e0b22", border: "#f59e0b44", label: "+1" },
};

export default function AltruistesGame() {
  const router = useRouter();
  const { play } = useSound();
  const completeGame = useGameStore((s) => s.completeGame);
  const unlockClue = useGameStore((s) => s.unlockClue);
  const faction = getFaction("altruistes")!;

  const [phase, setPhase] = useState<GamePhase>("intro");
  const [levelIndex, setLevelIndex] = useState(0);
  const [player, setPlayer] = useState<PlayerState>({ x: 0, y: 0, movesLeft: 12 });
  const [path, setPath] = useState<string[]>(["0,0"]);
  const [transitioning, setTransitioning] = useState(false);

  const level = PUZZLE_LEVELS[levelIndex];

  const initLevel = useCallback(
    (idx: number) => {
      const lvl = PUZZLE_LEVELS[idx];
      setLevelIndex(idx);
      setPlayer({
        x: lvl.startX,
        y: lvl.startY,
        movesLeft: lvl.maxMoves,
      });
      setPath([`${lvl.startX},${lvl.startY}`]);
      setTransitioning(false);
    },
    []
  );

  const startPlaying = () => {
    setPhase("playing");
    setLevelIndex(0);
    initLevel(0);
  };

  const isAdjacent = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.abs(x1 - x2);
    const dy = Math.abs(y1 - y2);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  };

  const handleCellClick = (x: number, y: number) => {
    if (phase !== "playing" || transitioning) return;

    // Must be adjacent to current position
    if (!isAdjacent(player.x, player.y, x, y)) return;

    const cell = level.grid[y][x];

    // Can't move into walls
    if (cell === "wall") return;

    // Calculate move cost
    let moveCost = 1;
    if (cell === "sacrifice") moveCost = 2;
    if (cell === "bonus") moveCost = 0; // bonus: free move

    if (player.movesLeft < moveCost) {
      play("failure");
      return;
    }

    const newMovesLeft = player.movesLeft - moveCost;
    const newPlayer: PlayerState = { x, y, movesLeft: newMovesLeft };
    setPlayer(newPlayer);
    setPath((prev) => [...prev, `${x},${y}`]);

    // Check if reached goal
    if (cell === "goal" || (x === level.goalX && y === level.goalY)) {
      play("success");
      if (levelIndex + 1 >= PUZZLE_LEVELS.length) {
        // All levels complete
        setPhase("won");
      } else {
        // Next level — show brief transition
        const nextIdx = levelIndex + 1;
        setTransitioning(true);
        setTimeout(() => initLevel(nextIdx), 500);
      }
      return;
    }

    // Check if stuck (no moves left and not at goal)
    if (newMovesLeft <= 0) {
      play("failure");
      setPhase("lost");
      return;
    }

    if (cell === "sacrifice") {
      play("countdown");
    } else {
      play("click");
    }
  };

  const restartLevel = () => {
    setPhase("playing");
    initLevel(levelIndex);
  };

  const handleWin = () => {
    completeGame("altruistes");
    unlockClue(
      "altruistes",
      "Le sacrifice DES CINQ ouvre la voie finale. Retiens ces derniers mots."
    );
    router.push("/clue/altruistes");
  };

  const gridSize = level?.grid.length || 6;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4">
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <h2
              className="text-3xl font-bold"
              style={{ color: faction.color }}
            >
              {faction.name}
            </h2>
            <p className="text-foreground/60 text-sm max-w-xs">
              {faction.description}
            </p>
            <div className="text-foreground/40 text-xs space-y-1">
              <p>Rejoins la sortie ★ en un nombre limité de mouvements.</p>
              <p>
                <span className="text-danger">−1</span> : cases de sacrifice
                (coûtent 2 mouvements)
              </p>
              <p>
                <span className="text-fraternels">+1</span> : cases bonus
                (mouvement gratuit)
              </p>
              <p>Planifie ton chemin avec soin.</p>
            </div>
            <Button
              onClick={startPlaying}
              variant="faction"
              factionColor={faction.color}
              size="lg"
            >
              Commencer
            </Button>
          </motion.div>
        )}

        {phase === "playing" && level && (
          <motion.div
            key={`playing-${levelIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center gap-4"
          >
            {/* HUD */}
            <div className="flex items-center justify-between w-full">
              <ScoreDisplay
                score={levelIndex + 1}
                total={PUZZLE_LEVELS.length}
                label="Niveau"
              />
              <div className="text-center">
                <span className="text-xs text-foreground/50">Mouvements</span>
                <p
                  className="text-2xl font-bold font-mono"
                  style={{
                    color: player.movesLeft <= 2 ? "#dc2626" : "#f0f0f0",
                  }}
                >
                  {player.movesLeft}
                </p>
              </div>
              <Button
                onClick={restartLevel}
                variant="ghost"
                size="sm"
              >
                ↺
              </Button>
            </div>

            {/* Grid */}
            <div
              className="grid gap-1 w-full max-w-xs mx-auto"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              }}
            >
              {level.grid.map((row, y) =>
                row.map((cell, x) => {
                  const isPlayer = player.x === x && player.y === y;
                  const isInPath = path.includes(`${x},${y}`);
                  const isClickable =
                    isAdjacent(player.x, player.y, x, y) &&
                    cell !== "wall";
                  const colors = CELL_COLORS[cell];

                  return (
                    <motion.button
                      key={`${x}-${y}`}
                      whileTap={isClickable ? { scale: 0.9 } : {}}
                      onClick={() => handleCellClick(x, y)}
                      disabled={!isClickable}
                      className="aspect-square rounded-md border text-xs font-bold flex items-center justify-center transition-all relative cursor-pointer disabled:cursor-default"
                      style={{
                        backgroundColor: isPlayer
                          ? `${faction.color}44`
                          : isInPath && cell !== "start"
                            ? `${faction.color}15`
                            : colors.bg,
                        borderColor: isPlayer
                          ? faction.color
                          : isClickable
                            ? `${faction.color}55`
                            : colors.border,
                        boxShadow: isPlayer
                          ? `0 0 10px ${faction.color}44`
                          : isClickable
                            ? `0 0 5px ${faction.color}22`
                            : "none",
                      }}
                    >
                      {isPlayer ? (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-sm"
                          style={{ color: faction.color }}
                        >
                          ●
                        </motion.span>
                      ) : cell === "goal" ? (
                        <span className="text-success text-sm">★</span>
                      ) : cell === "sacrifice" ? (
                        <span className="text-danger text-[10px]">−1</span>
                      ) : cell === "bonus" ? (
                        <span className="text-fraternels text-[10px]">+1</span>
                      ) : cell === "wall" ? (
                        <span className="text-foreground/20">▪</span>
                      ) : null}
                    </motion.button>
                  );
                })
              )}
            </div>

            {/* Level transition overlay */}
            {transitioning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-success text-sm font-semibold"
              >
                Niveau suivant...
              </motion.div>
            )}

            {/* Legend */}
            <div className="flex gap-4 text-[10px] text-foreground/40">
              <span>● Toi</span>
              <span className="text-success">★ Sortie</span>
              <span className="text-danger">−1 Sacrifice</span>
              <span className="text-fraternels">+1 Bonus</span>
            </div>
          </motion.div>
        )}

        {phase === "won" && (
          <motion.div
            key="won"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="text-6xl"
            >
              🕊️
            </motion.div>
            <h2
              className="text-2xl font-bold"
              style={{ color: faction.color }}
            >
              Sacrifice accompli !
            </h2>
            <p className="text-foreground/60 text-sm">
              Tu as résolu les {PUZZLE_LEVELS.length} niveaux. Les Altruistes te
              respectent.
            </p>
            <Button
              onClick={handleWin}
              variant="faction"
              factionColor={faction.color}
              size="lg"
            >
              Découvrir l&apos;indice
            </Button>
          </motion.div>
        )}

        {phase === "lost" && (
          <motion.div
            key="lost"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className="text-6xl"
            >
              🔒
            </motion.div>
            <h2 className="text-2xl font-bold text-danger">Bloqué(e)</h2>
            <p className="text-foreground/60 text-sm">
              Plus de mouvements disponibles. Repense ta stratégie.
            </p>
            <Button onClick={restartLevel} variant="danger" size="lg">
              Recommencer le niveau
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
