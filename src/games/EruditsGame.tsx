"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { useSound } from "@/hooks/useSound";
import { useGameTimer } from "@/hooks/useGameTimer";
import { getFaction } from "@/data/factions";
import { QUIZ_QUESTIONS } from "@/data/questions";
import Button from "@/components/ui/Button";
import Timer from "@/components/ui/Timer";
import ScoreDisplay from "@/components/ui/ScoreDisplay";

const TOTAL_QUESTIONS = 10;
const TIME_LIMIT = 60;
const MIN_SCORE = 7;

type GamePhase = "intro" | "playing" | "won" | "lost";

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function EruditsGame() {
  const router = useRouter();
  const { play } = useSound();
  const completeGame = useGameStore((s) => s.completeGame);
  const unlockClue = useGameStore((s) => s.unlockClue);
  const faction = getFaction("erudits")!;

  const [phase, setPhase] = useState<GamePhase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const questions = useMemo(
    () => shuffleArray(QUIZ_QUESTIONS).slice(0, TOTAL_QUESTIONS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase] // regenerate on restart
  );

  const handleTimeUp = useCallback(() => {
    if (score >= MIN_SCORE) {
      setPhase("won");
      play("success");
    } else {
      setPhase("lost");
      play("failure");
    }
  }, [score, play]);

  const { timeLeft, start, reset: resetTimer } = useGameTimer({
    initialTime: TIME_LIMIT,
    onTimeUp: handleTimeUp,
  });

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (index: number) => {
    if (feedback !== null) return; // prevent double-tap
    setSelectedAnswer(index);

    const isCorrect = index === currentQuestion.correctIndex;
    setFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setScore((prev) => prev + 1);
      play("success");
    } else {
      play("failure");
    }

    setTimeout(() => {
      setFeedback(null);
      setSelectedAnswer(null);
      if (currentIndex + 1 >= TOTAL_QUESTIONS) {
        // All questions answered
        const finalScore = isCorrect ? score + 1 : score;
        if (finalScore >= MIN_SCORE) {
          setPhase("won");
          play("success");
        } else {
          setPhase("lost");
          play("failure");
        }
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 800);
  };

  const startPlaying = () => {
    setPhase("playing");
    setCurrentIndex(0);
    setScore(0);
    setFeedback(null);
    setSelectedAnswer(null);
    resetTimer();
    setTimeout(start, 100);
  };

  const handleWin = () => {
    completeGame("erudits");
    unlockClue(
      "erudits",
      "L'intelligence révèle les mots cachés. Observe : les caBINETS perdent leur première syllabe. Que reste-t-il ?"
    );
    router.push("/clue/erudits");
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
              <p>{TOTAL_QUESTIONS} questions de logique en {TIME_LIMIT} secondes.</p>
              <p>Minimum {MIN_SCORE}/{TOTAL_QUESTIONS} pour réussir.</p>
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

        {phase === "playing" && currentQuestion && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center gap-5"
          >
            {/* HUD */}
            <div className="flex items-center justify-between w-full">
              <ScoreDisplay score={score} total={TOTAL_QUESTIONS} />
              <Timer timeLeft={timeLeft} maxTime={TIME_LIMIT} />
              <div className="text-foreground/40 text-xs">
                Q{currentIndex + 1}/{TOTAL_QUESTIONS}
              </div>
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div
                  className="p-5 rounded-xl border mb-4"
                  style={{
                    borderColor: `${faction.color}33`,
                    backgroundColor: `${faction.color}08`,
                  }}
                >
                  <p className="text-foreground text-sm leading-relaxed font-medium">
                    {currentQuestion.question}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-2.5">
                  {currentQuestion.options.map((option, i) => {
                    let bgColor = `${faction.color}10`;
                    let borderColor = `${faction.color}22`;

                    if (feedback !== null && i === currentQuestion.correctIndex) {
                      bgColor = "#10b98133";
                      borderColor = "#10b98166";
                    } else if (
                      feedback === "wrong" &&
                      i === selectedAnswer
                    ) {
                      bgColor = "#dc262633";
                      borderColor = "#dc262666";
                    }

                    return (
                      <motion.button
                        key={i}
                        whileTap={{ scale: feedback === null ? 0.97 : 1 }}
                        onClick={() => handleAnswer(i)}
                        disabled={feedback !== null}
                        className="w-full text-left p-4 rounded-lg border transition-all text-sm cursor-pointer disabled:cursor-default"
                        style={{
                          backgroundColor: bgColor,
                          borderColor: borderColor,
                        }}
                      >
                        <span className="font-mono text-foreground/40 mr-2">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        {option}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
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
              🧠
            </motion.div>
            <h2
              className="text-2xl font-bold"
              style={{ color: faction.color }}
            >
              Intelligence prouvée !
            </h2>
            <p className="text-foreground/60 text-sm">
              Score : {score}/{TOTAL_QUESTIONS}. Les Érudits t&apos;accueillent.
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
              📚
            </motion.div>
            <h2 className="text-2xl font-bold text-danger">Échec intellectuel</h2>
            <p className="text-foreground/60 text-sm">
              Score : {score}/{TOTAL_QUESTIONS}. Il faut au moins {MIN_SCORE} bonnes réponses.
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
