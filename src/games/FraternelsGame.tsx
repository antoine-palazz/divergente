"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { useSound } from "@/hooks/useSound";
import { getFaction } from "@/data/factions";
import Button from "@/components/ui/Button";
import ScoreDisplay from "@/components/ui/ScoreDisplay";

const REQUIRED_ALIGNMENTS = 10;
const BASE_SPEED_1 = 1.2; // pixels per frame
const BASE_SPEED_2 = 0.8;
const BASE_TOLERANCE = 12; // percent overlap tolerance
const MIN_TOLERANCE = 4;
const SPEED_INCREASE = 0.15;
const TOLERANCE_DECREASE = 0.8;

type GamePhase = "intro" | "playing" | "won";

export default function FraternelsGame() {
  const router = useRouter();
  const { play } = useSound();
  const completeGame = useGameStore((s) => s.completeGame);
  const unlockClue = useGameStore((s) => s.unlockClue);
  const faction = getFaction("fraternels")!;

  const [phase, setPhase] = useState<GamePhase>("intro");
  const [alignments, setAlignments] = useState(0);
  const [bar1Pos, setBar1Pos] = useState(20);
  const [bar2Pos, setBar2Pos] = useState(80);
  const [feedback, setFeedback] = useState<"hit" | "miss" | null>(null);
  const [attempts, setAttempts] = useState(0);

  const animRef = useRef<number>(0);
  const bar1Ref = useRef({ pos: 20, dir: 1 });
  const bar2Ref = useRef({ pos: 80, dir: -1 });
  const phaseRef = useRef<GamePhase>("intro");
  const alignmentsRef = useRef(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    alignmentsRef.current = alignments;
  }, [alignments]);

  const currentTolerance = Math.max(
    MIN_TOLERANCE,
    BASE_TOLERANCE - alignments * TOLERANCE_DECREASE
  );
  const speedMultiplier = 1 + alignments * SPEED_INCREASE;

  const gameLoop = useCallback(() => {
    if (phaseRef.current !== "playing") return;

    const speed1 = BASE_SPEED_1 * (1 + alignmentsRef.current * SPEED_INCREASE);
    const speed2 = BASE_SPEED_2 * (1 + alignmentsRef.current * SPEED_INCREASE);

    // Move bar 1
    bar1Ref.current.pos += speed1 * bar1Ref.current.dir;
    if (bar1Ref.current.pos >= 90 || bar1Ref.current.pos <= 10) {
      bar1Ref.current.dir *= -1;
    }

    // Move bar 2
    bar2Ref.current.pos += speed2 * bar2Ref.current.dir;
    if (bar2Ref.current.pos >= 90 || bar2Ref.current.pos <= 10) {
      bar2Ref.current.dir *= -1;
    }

    setBar1Pos(bar1Ref.current.pos);
    setBar2Pos(bar2Ref.current.pos);

    animRef.current = requestAnimationFrame(gameLoop);
  }, []);

  const startPlaying = () => {
    setPhase("playing");
    phaseRef.current = "playing";
    setAlignments(0);
    alignmentsRef.current = 0;
    setAttempts(0);
    setFeedback(null);
    bar1Ref.current = { pos: 20, dir: 1 };
    bar2Ref.current = { pos: 80, dir: -1 };
    animRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const handleTap = () => {
    if (phase !== "playing" || feedback !== null) return;

    const tolerance = Math.max(
      MIN_TOLERANCE,
      BASE_TOLERANCE - alignmentsRef.current * TOLERANCE_DECREASE
    );
    const distance = Math.abs(bar1Ref.current.pos - bar2Ref.current.pos);

    setAttempts((prev) => prev + 1);

    if (distance <= tolerance) {
      const newAlignments = alignmentsRef.current + 1;
      setAlignments(newAlignments);
      alignmentsRef.current = newAlignments;
      setFeedback("hit");
      play("success");

      if (newAlignments >= REQUIRED_ALIGNMENTS) {
        setPhase("won");
        phaseRef.current = "won";
        cancelAnimationFrame(animRef.current);
      }
    } else {
      setFeedback("miss");
      play("failure");
    }

    setTimeout(() => setFeedback(null), 300);
  };

  const handleWin = () => {
    completeGame("fraternels");
    unlockClue(
      "fraternels",
      "L'harmonie rassemble les âmes. N'oublie pas : l'union forme LE CLUB, lié par un trait au sol."
    );
    router.push("/clue/fraternels");
  };

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
              <p>Deux barres se déplacent horizontalement.</p>
              <p>
                Appuie au moment exact où elles s&apos;alignent.
              </p>
              <p>{REQUIRED_ALIGNMENTS} alignements parfaits pour réussir.</p>
              <p>La difficulté augmente à chaque succès.</p>
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
            className="w-full flex flex-col items-center gap-5"
          >
            {/* HUD */}
            <div className="flex items-center justify-between w-full">
              <ScoreDisplay
                score={alignments}
                total={REQUIRED_ALIGNMENTS}
                label="Alignements"
              />
              <div className="text-right">
                <span className="text-xs text-foreground/50">Vitesse</span>
                <p className="text-sm font-mono text-foreground/70">
                  x{speedMultiplier.toFixed(1)}
                </p>
              </div>
            </div>

            {/* Game area */}
            <motion.div
              className="relative w-full rounded-xl overflow-hidden game-area no-select cursor-pointer"
              style={{
                height: "50dvh",
                maxHeight: "400px",
                backgroundColor: "#0d1117",
                border: `1px solid ${
                  feedback === "hit"
                    ? "#10b98166"
                    : feedback === "miss"
                      ? "#dc262666"
                      : `${faction.color}33`
                }`,
              }}
              onClick={handleTap}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleTap();
              }}
            >
              {/* Feedback flash */}
              {feedback && (
                <motion.div
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 z-20 pointer-events-none"
                  style={{
                    backgroundColor:
                      feedback === "hit" ? "#10b98133" : "#dc262633",
                  }}
                />
              )}

              {/* Tolerance zone indicator */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-12 opacity-20 rounded"
                style={{
                  left: `${bar1Pos - currentTolerance / 2}%`,
                  width: `${currentTolerance}%`,
                  backgroundColor: faction.color,
                }}
              />

              {/* Bar 1 - top half */}
              <motion.div
                className="absolute top-[35%] h-3 w-3 rounded-full z-10"
                style={{
                  left: `${bar1Pos}%`,
                  backgroundColor: faction.color,
                  boxShadow: `0 0 12px ${faction.color}88`,
                  transform: "translateX(-50%)",
                }}
              />
              {/* Bar 1 vertical line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 opacity-60 z-5"
                style={{
                  left: `${bar1Pos}%`,
                  backgroundColor: faction.color,
                  transform: "translateX(-50%)",
                }}
              />

              {/* Bar 2 - bottom half */}
              <motion.div
                className="absolute top-[65%] h-3 w-3 rounded-full z-10"
                style={{
                  left: `${bar2Pos}%`,
                  backgroundColor: "#4a9eff",
                  boxShadow: "0 0 12px rgba(74, 158, 255, 0.5)",
                  transform: "translateX(-50%)",
                }}
              />
              {/* Bar 2 vertical line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 opacity-60 z-5"
                style={{
                  left: `${bar2Pos}%`,
                  backgroundColor: "#4a9eff",
                  transform: "translateX(-50%)",
                }}
              />

              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-foreground/20 text-sm font-medium">
                  APPUIE
                </p>
              </div>
            </motion.div>

            {/* Tolerance info */}
            <p className="text-foreground/30 text-xs text-center">
              Tolérance : {currentTolerance.toFixed(1)}% — Appuie quand les
              lignes se croisent
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
              🤝
            </motion.div>
            <h2
              className="text-2xl font-bold"
              style={{ color: faction.color }}
            >
              Harmonie atteinte !
            </h2>
            <p className="text-foreground/60 text-sm">
              {REQUIRED_ALIGNMENTS} alignements en {attempts} tentatives. Les
              Fraternels t&apos;accueillent.
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
      </AnimatePresence>
    </div>
  );
}
