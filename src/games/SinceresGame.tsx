"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { useSound } from "@/hooks/useSound";
import { getFaction } from "@/data/factions";
import { STATEMENTS } from "@/data/statements";
import Button from "@/components/ui/Button";
import ScoreDisplay from "@/components/ui/ScoreDisplay";

const TOTAL_STATEMENTS = 15;
const ACCURACY_THRESHOLD = 0.8; // 80%
const TIME_START = 8; // seconds per question
const TIME_MIN = 3;
const TIME_DECREASE = 0.35; // decrease per round

type GamePhase = "intro" | "playing" | "won" | "lost";

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function SinceresGame() {
  const router = useRouter();
  const { play } = useSound();
  const completeGame = useGameStore((s) => s.completeGame);
  const unlockClue = useGameStore((s) => s.unlockClue);
  const faction = getFaction("sinceres")!;

  const [phase, setPhase] = useState<GamePhase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [statementTimer, setStatementTimer] = useState(TIME_START);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<GamePhase>("intro");

  const statements = useMemo(
    () => shuffleArray(STATEMENTS).slice(0, TOTAL_STATEMENTS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase]
  );

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const currentTimeLimit = Math.max(
    TIME_MIN,
    TIME_START - currentIndex * TIME_DECREASE
  );

  const currentStatement = statements[currentIndex];

  // Per-statement countdown
  useEffect(() => {
    if (phase !== "playing" || feedback !== null) return;

    setStatementTimer(currentTimeLimit);
    timerRef.current = setInterval(() => {
      setStatementTimer((prev) => {
        if (prev <= 0.1) {
          // Time expired — count as wrong
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentIndex, feedback]);

  const evaluateResult = useCallback(
    (finalCorrect: number, finalTotal: number) => {
      const accuracy = finalTotal > 0 ? finalCorrect / finalTotal : 0;
      if (accuracy >= ACCURACY_THRESHOLD) {
        setPhase("won");
        play("success");
      } else {
        setPhase("lost");
        play("failure");
      }
    },
    [play]
  );

  const handleTimeout = useCallback(() => {
    setFeedback("wrong");
    setTotal((prev) => prev + 1);
    play("failure");

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex + 1 >= TOTAL_STATEMENTS) {
        // timeout counts as wrong — correct stays the same, total + 1
        evaluateResult(correct, total + 1);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, currentIndex, correct, total, evaluateResult]);

  const handleAnswer = (answer: boolean) => {
    if (feedback !== null || phase !== "playing") return;
    if (timerRef.current) clearInterval(timerRef.current);

    const isCorrect = answer === currentStatement.isTrue;
    setFeedback(isCorrect ? "correct" : "wrong");
    setTotal((prev) => prev + 1);

    if (isCorrect) {
      setCorrect((prev) => prev + 1);
      play("success");
    } else {
      play("failure");
    }

    setTimeout(() => {
      setFeedback(null);
      const nextIndex = currentIndex + 1;
      if (nextIndex >= TOTAL_STATEMENTS) {
        const finalCorrect = isCorrect ? correct + 1 : correct;
        const finalTotal = total + 1;
        evaluateResult(finalCorrect, finalTotal);
      } else {
        setCurrentIndex(nextIndex);
      }
    }, 600);
  };

  const startPlaying = () => {
    setPhase("playing");
    setCurrentIndex(0);
    setCorrect(0);
    setTotal(0);
    setFeedback(null);
  };

  const handleWin = () => {
    completeGame("sinceres");
    unlockClue(
      "sinceres",
      "Le point précède la vérité. Le pays des lumières tient en deux lettres. La barre ouvre le chemin. Assemble-les : .FR/"
    );
    router.push("/clue/sinceres");
  };

  const accuracyPct = total > 0 ? Math.round((correct / total) * 100) : 0;

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
              <p>Détermine si chaque affirmation est vraie ou fausse.</p>
              <p>Le temps de réponse diminue à chaque question.</p>
              <p>Précision minimale : {ACCURACY_THRESHOLD * 100}%</p>
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

        {phase === "playing" && currentStatement && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center gap-5"
          >
            {/* HUD */}
            <div className="flex items-center justify-between w-full">
              <ScoreDisplay score={correct} total={total} label="Correct" />
              <div className="text-foreground/40 text-xs">
                {currentIndex + 1}/{TOTAL_STATEMENTS}
              </div>
              <div className="text-right">
                <span className="text-xs text-foreground/50">Précision</span>
                <p
                  className="text-lg font-bold font-mono"
                  style={{
                    color:
                      accuracyPct >= ACCURACY_THRESHOLD * 100
                        ? "#10b981"
                        : "#dc2626",
                  }}
                >
                  {accuracyPct}%
                </p>
              </div>
            </div>

            {/* Timer bar */}
            <div className="w-full h-1.5 rounded-full bg-foreground/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  backgroundColor:
                    statementTimer > currentTimeLimit * 0.3
                      ? faction.color
                      : "#dc2626",
                }}
                animate={{
                  width: `${(statementTimer / currentTimeLimit) * 100}%`,
                }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Statement */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStatement.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="w-full p-6 rounded-xl border text-center"
                style={{
                  borderColor:
                    feedback === "correct"
                      ? "#10b98166"
                      : feedback === "wrong"
                        ? "#dc262666"
                        : `${faction.color}33`,
                  backgroundColor:
                    feedback === "correct"
                      ? "#10b98115"
                      : feedback === "wrong"
                        ? "#dc262615"
                        : `${faction.color}08`,
                }}
              >
                <p className="text-foreground text-sm leading-relaxed font-medium">
                  &ldquo;{currentStatement.text}&rdquo;
                </p>
              </motion.div>
            </AnimatePresence>

            {/* VRAI / FAUX buttons */}
            <div className="flex gap-4 w-full">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(true)}
                disabled={feedback !== null}
                className="flex-1 py-4 rounded-xl text-lg font-bold border transition-all cursor-pointer disabled:cursor-default"
                style={{
                  backgroundColor: "#10b98120",
                  borderColor: "#10b98144",
                  color: "#10b981",
                }}
              >
                VRAI
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(false)}
                disabled={feedback !== null}
                className="flex-1 py-4 rounded-xl text-lg font-bold border transition-all cursor-pointer disabled:cursor-default"
                style={{
                  backgroundColor: "#dc262620",
                  borderColor: "#dc262644",
                  color: "#dc2626",
                }}
              >
                FAUX
              </motion.button>
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
              ⚖️
            </motion.div>
            <h2
              className="text-2xl font-bold"
              style={{ color: faction.color }}
            >
              La vérité triomphe !
            </h2>
            <p className="text-foreground/60 text-sm">
              Précision : {accuracyPct}%. Les Sincères te reconnaissent.
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
              🎭
            </motion.div>
            <h2 className="text-2xl font-bold text-danger">
              Trop d&apos;erreurs
            </h2>
            <p className="text-foreground/60 text-sm">
              Précision : {accuracyPct}%. Il faut au moins{" "}
              {ACCURACY_THRESHOLD * 100}%.
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
