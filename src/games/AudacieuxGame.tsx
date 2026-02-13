"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { useSound } from "@/hooks/useSound";
import { getFaction } from "@/data/factions";
import Button from "@/components/ui/Button";
import LivesDisplay from "@/components/ui/LivesDisplay";
import Timer from "@/components/ui/Timer";

const LANE_COUNT = 3;
const SURVIVAL_TIME = 35;
const MAX_LIVES = 3;
const OBSTACLE_INTERVAL_BASE = 900; // ms
const SPEED_INCREASE_INTERVAL = 10; // seconds

interface Obstacle {
  id: number;
  lane: number;
  y: number;
  type: "wall" | "spike";
}

type GamePhase = "intro" | "playing" | "won" | "lost";

export default function AudacieuxGame() {
  const router = useRouter();
  const { play } = useSound();
  const completeGame = useGameStore((s) => s.completeGame);
  const unlockClue = useGameStore((s) => s.unlockClue);
  const faction = getFaction("audacieux")!;

  const [phase, setPhase] = useState<GamePhase>("intro");
  const [playerLane, setPlayerLane] = useState(1); // 0, 1, 2
  const [lives, setLives] = useState(MAX_LIVES);
  const [timeLeft, setTimeLeft] = useState(SURVIVAL_TIME);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [flash, setFlash] = useState<string | null>(null);

  const gameRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const obstacleIdRef = useRef(0);
  const lastObstacleTimeRef = useRef(0);
  const startTimeRef = useRef(0);
  const livesRef = useRef(MAX_LIVES);
  const playerLaneRef = useRef(1);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const phaseRef = useRef<GamePhase>("intro");
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Keep refs in sync
  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);
  useEffect(() => {
    playerLaneRef.current = playerLane;
  }, [playerLane]);
  useEffect(() => {
    obstaclesRef.current = obstacles;
  }, [obstacles]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const getSpeedMultiplier = useCallback(() => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    return 1 + Math.floor(elapsed / SPEED_INCREASE_INTERVAL) * 0.3;
  }, []);

  const hitObstacle = useCallback(() => {
    const newLives = livesRef.current - 1;
    setLives(newLives);
    livesRef.current = newLives;
    play("failure");
    setFlash("red");
    setTimeout(() => setFlash(null), 200);

    if (newLives <= 0) {
      setPhase("lost");
      phaseRef.current = "lost";
    }
  }, [play]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (phaseRef.current !== "playing") return;

    const now = Date.now();
    const elapsed = (now - startTimeRef.current) / 1000;
    const speedMul = 1 + Math.floor(elapsed / SPEED_INCREASE_INTERVAL) * 0.3;
    const newTimeLeft = Math.max(0, SURVIVAL_TIME - Math.floor(elapsed));

    setTimeLeft(newTimeLeft);

    if (newTimeLeft <= 0) {
      setPhase("won");
      phaseRef.current = "won";
      play("success");
      return;
    }

    // Spawn obstacles
    const obstacleInterval = OBSTACLE_INTERVAL_BASE / speedMul;
    if (now - lastObstacleTimeRef.current > obstacleInterval) {
      lastObstacleTimeRef.current = now;
      const lane = Math.floor(Math.random() * LANE_COUNT);
      const newObs: Obstacle = {
        id: obstacleIdRef.current++,
        lane,
        y: -10,
        type: Math.random() > 0.5 ? "wall" : "spike",
      };
      obstaclesRef.current = [...obstaclesRef.current, newObs];
    }

    // Move obstacles
    const moveSpeed = 1.5 * speedMul;
    const updated = obstaclesRef.current
      .map((o) => ({ ...o, y: o.y + moveSpeed }))
      .filter((o) => o.y < 110);

    // Collision detection: obstacle in player lane, in hit zone (75-95% of height)
    const collisions = updated.filter(
      (o) => o.lane === playerLaneRef.current && o.y > 75 && o.y < 95
    );

    if (collisions.length > 0) {
      // Remove collided obstacles
      const collidedIds = new Set(collisions.map((c) => c.id));
      const remaining = updated.filter((o) => !collidedIds.has(o.id));
      obstaclesRef.current = remaining;
      setObstacles(remaining);
      hitObstacle();
    } else {
      obstaclesRef.current = updated;
      setObstacles(updated);
    }

    animRef.current = requestAnimationFrame(gameLoop);
  }, [hitObstacle, play]);

  // Start game
  const startPlaying = useCallback(() => {
    setPhase("playing");
    phaseRef.current = "playing";
    setLives(MAX_LIVES);
    livesRef.current = MAX_LIVES;
    setTimeLeft(SURVIVAL_TIME);
    setObstacles([]);
    obstaclesRef.current = [];
    setPlayerLane(1);
    playerLaneRef.current = 1;
    startTimeRef.current = Date.now();
    lastObstacleTimeRef.current = Date.now();
    obstacleIdRef.current = 0;
    animRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  // Cleanup animation frame
  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (phaseRef.current !== "playing") return;
      if (e.key === "ArrowLeft" || e.key === "a") {
        setPlayerLane((prev) => {
          const n = Math.max(0, prev - 1);
          playerLaneRef.current = n;
          return n;
        });
      } else if (e.key === "ArrowRight" || e.key === "d") {
        setPlayerLane((prev) => {
          const n = Math.min(LANE_COUNT - 1, prev + 1);
          playerLaneRef.current = n;
          return n;
        });
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || phaseRef.current !== "playing") return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const threshold = 30;

    if (Math.abs(dx) > threshold) {
      if (dx < 0) {
        setPlayerLane((prev) => {
          const n = Math.max(0, prev - 1);
          playerLaneRef.current = n;
          return n;
        });
      } else {
        setPlayerLane((prev) => {
          const n = Math.min(LANE_COUNT - 1, prev + 1);
          playerLaneRef.current = n;
          return n;
        });
      }
    }
    touchStartRef.current = null;
  };

  // Tap left/right zones
  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (phaseRef.current !== "playing" || !gameRef.current) return;
    const rect = gameRef.current.getBoundingClientRect();
    const clientX =
      "touches" in e
        ? e.changedTouches[0].clientX
        : (e as React.MouseEvent).clientX;
    const relX = (clientX - rect.left) / rect.width;
    if (relX < 0.33) {
      setPlayerLane((prev) => {
        const n = Math.max(0, prev - 1);
        playerLaneRef.current = n;
        return n;
      });
    } else if (relX > 0.66) {
      setPlayerLane((prev) => {
        const n = Math.min(LANE_COUNT - 1, prev + 1);
        playerLaneRef.current = n;
        return n;
      });
    }
  };

  const handleWin = () => {
    completeGame("audacieux");
    unlockClue(
      "audacieux",
      "Le courage transforme ce qui est long. Retiens ceci : ce qui est long doit être rendu... COURT."
    );
    router.push("/clue/audacieux");
  };

  const laneWidth = 100 / LANE_COUNT;

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-4">
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
              <p>Glisse à gauche ou à droite pour éviter les obstacles.</p>
              <p>Survie pendant {SURVIVAL_TIME} secondes pour gagner.</p>
              <p>Tu as {MAX_LIVES} vies. Bonne chance.</p>
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

        {phase === "playing" && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center gap-3"
          >
            {/* HUD */}
            <div className="flex items-center justify-between w-full px-2">
              <LivesDisplay lives={lives} maxLives={MAX_LIVES} />
              <Timer timeLeft={timeLeft} maxTime={SURVIVAL_TIME} />
            </div>

            {/* Game area */}
            <div
              ref={gameRef}
              className="relative w-full rounded-xl overflow-hidden game-area no-select"
              style={{
                aspectRatio: "3/5",
                maxHeight: "60dvh",
                backgroundColor: "#0d1117",
                border: `1px solid ${faction.color}33`,
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onClick={handleTap}
            >
              {/* Flash overlay */}
              {flash && (
                <div
                  className="absolute inset-0 z-30 pointer-events-none"
                  style={{ backgroundColor: `${flash === "red" ? "#dc2626" : "#10b981"}33` }}
                />
              )}

              {/* Lane dividers */}
              {Array.from({ length: LANE_COUNT - 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 w-px opacity-10"
                  style={{
                    left: `${((i + 1) / LANE_COUNT) * 100}%`,
                    backgroundColor: faction.color,
                  }}
                />
              ))}

              {/* Obstacles */}
              {obstacles.map((obs) => (
                <div
                  key={obs.id}
                  className="absolute transition-none"
                  style={{
                    left: `${obs.lane * laneWidth + laneWidth * 0.15}%`,
                    top: `${obs.y}%`,
                    width: `${laneWidth * 0.7}%`,
                    height: "6%",
                  }}
                >
                  <div
                    className="w-full h-full rounded-md"
                    style={{
                      backgroundColor:
                        obs.type === "wall"
                          ? `${faction.color}cc`
                          : "#dc2626cc",
                      boxShadow:
                        obs.type === "spike"
                          ? "0 0 8px rgba(220,38,38,0.5)"
                          : `0 0 8px ${faction.color}44`,
                    }}
                  />
                </div>
              ))}

              {/* Player */}
              <motion.div
                className="absolute bottom-[8%]"
                animate={{
                  left: `${playerLane * laneWidth + laneWidth * 0.25}%`,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                style={{
                  width: `${laneWidth * 0.5}%`,
                  height: "5%",
                }}
              >
                <div
                  className="w-full h-full rounded-lg"
                  style={{
                    backgroundColor: faction.color,
                    boxShadow: `0 0 15px ${faction.color}66`,
                  }}
                />
              </motion.div>

              {/* Speed indicator */}
              <div className="absolute top-2 left-2 text-xs font-mono opacity-40">
                x{getSpeedMultiplier().toFixed(1)}
              </div>
            </div>

            {/* Mobile controls hint */}
            <p className="text-foreground/30 text-xs text-center">
              ← Glisse ou appuie sur les côtés →
            </p>
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
              🔥
            </motion.div>
            <h2
              className="text-2xl font-bold"
              style={{ color: faction.color }}
            >
              Épreuve réussie !
            </h2>
            <p className="text-foreground/60 text-sm">
              Tu as survécu {SURVIVAL_TIME} secondes. Les Audacieux seraient
              fiers.
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
              💀
            </motion.div>
            <h2 className="text-2xl font-bold text-danger">Éliminé(e)</h2>
            <p className="text-foreground/60 text-sm">
              Tu n&apos;as pas survécu assez longtemps. Réessaie.
            </p>
            <Button onClick={startPlaying} variant="danger" size="lg">
              Recommencer
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
