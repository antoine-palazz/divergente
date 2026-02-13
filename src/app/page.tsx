"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, hydrateStore } from "@/store/gameStore";
import { FACTIONS, GAME_ORDER } from "@/data/factions";
import GlitchText from "@/components/effects/GlitchText";
import Button from "@/components/ui/Button";
import MuteToggle from "@/components/ui/MuteToggle";
import { FactionSlug } from "@/types";

export default function LandingPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const hasStarted = useGameStore((s) => s.hasStarted);
  const completedGames = useGameStore((s) => s.completedGames);
  const startGame = useGameStore((s) => s.startGame);
  const resetProgress = useGameStore((s) => s.resetProgress);
  const isFinalUnlocked = useGameStore((s) => s.isFinalUnlocked);

  useEffect(() => {
    hydrateStore();
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && hasStarted) {
      setShowIntro(false);
    }
  }, [hydrated, hasStarted]);

  const handleStart = () => {
    startGame();
    router.push("/game/audacieux");
  };

  const handleContinue = () => {
    if (isFinalUnlocked()) {
      router.push("/final");
      return;
    }
    // Find the next unlocked game
    for (const slug of GAME_ORDER) {
      if (!completedGames.includes(slug as FactionSlug)) {
        router.push(`/game/${slug}`);
        return;
      }
    }
    router.push("/final");
  };

  const handleReset = () => {
    resetProgress();
    setShowIntro(true);
  };

  if (!hydrated) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 safe-padding relative overflow-hidden">
      {/* Mute toggle top-right */}
      <div className="fixed top-4 right-4 z-50">
        <MuteToggle />
      </div>

      <AnimatePresence mode="wait">
        {showIntro ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-8 max-w-lg text-center"
          >
            {/* Logo / Title */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <GlitchText
                text="DIVERGENTE"
                className="text-5xl sm:text-7xl font-black tracking-widest text-foreground"
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-foreground/60 text-lg leading-relaxed"
            >
              Tu as été identifié(e) comme potentiellement{" "}
              <span className="text-primary font-semibold">Divergent(e)</span>.
              <br />
              Cinq factions. Cinq épreuves. Un seul secret à découvrir.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="text-foreground/40 text-sm italic"
            >
              — Le Maître du Jeu, Antoine
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              <Button onClick={handleStart} size="lg">
                Commencer l&apos;épreuve
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-8 max-w-lg w-full"
          >
            <GlitchText
              text="DIVERGENTE"
              className="text-4xl sm:text-5xl font-black tracking-widest text-foreground"
            />

            <p className="text-foreground/50 text-sm text-center">
              Ta progression dans les épreuves des factions
            </p>

            {/* Faction progress cards */}
            <div className="w-full space-y-3">
              {FACTIONS.map((faction, i) => {
                const isCompleted = completedGames.includes(faction.slug);
                const isNext =
                  !isCompleted &&
                  (i === 0 ||
                    completedGames.includes(FACTIONS[i - 1].slug));

                return (
                  <motion.div
                    key={faction.slug}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl border transition-all"
                    style={{
                      borderColor: isCompleted
                        ? `${faction.color}66`
                        : isNext
                          ? `${faction.color}33`
                          : "rgba(255,255,255,0.05)",
                      backgroundColor: isCompleted
                        ? `${faction.color}10`
                        : "transparent",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shrink-0"
                      style={{
                        backgroundColor: `${faction.color}20`,
                        color: faction.color,
                      }}
                    >
                      {isCompleted ? "✓" : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-semibold text-sm"
                        style={{ color: faction.color }}
                      >
                        {faction.name}
                      </p>
                      <p className="text-foreground/40 text-xs truncate">
                        {faction.subtitle}
                      </p>
                    </div>
                    <span
                      className="text-xs font-medium px-2 py-1 rounded-md"
                      style={{
                        backgroundColor: isCompleted
                          ? `${faction.color}20`
                          : "rgba(255,255,255,0.05)",
                        color: isCompleted
                          ? faction.color
                          : "rgba(255,255,255,0.3)",
                      }}
                    >
                      {isCompleted
                        ? "Complété"
                        : isNext
                          ? "En cours"
                          : "Verrouillé"}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={handleContinue}
                size="md"
                className="flex-1"
              >
                {isFinalUnlocked() ? "Épreuve finale" : "Continuer"}
              </Button>
              <Button
                onClick={handleReset}
                variant="ghost"
                size="md"
                className="flex-1"
              >
                Recommencer
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
