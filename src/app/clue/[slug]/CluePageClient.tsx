"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGameStore, hydrateStore } from "@/store/gameStore";
import { getFaction, getNextFaction } from "@/data/factions";
import { getClue } from "@/data/clues";
import { FactionSlug } from "@/types";
import Button from "@/components/ui/Button";
import MuteToggle from "@/components/ui/MuteToggle";
import ProgressBar from "@/components/ui/ProgressBar";
import PageTransition from "@/components/effects/PageTransition";

export default function CluePageClient({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [typewriterDone, setTypewriterDone] = useState(false);

  const completedGames = useGameStore((s) => s.completedGames);
  const isFinalUnlocked = useGameStore((s) => s.isFinalUnlocked);

  const faction = getFaction(slug);
  const clue = getClue(slug);
  const nextFaction = getNextFaction(slug);

  useEffect(() => {
    hydrateStore();
    setHydrated(true);
  }, []);

  // Redirect if game not completed
  useEffect(() => {
    if (!hydrated) return;
    if (!completedGames.includes(slug as FactionSlug)) {
      router.replace("/");
    }
  }, [hydrated, completedGames, slug, router]);

  // Typewriter effect
  useEffect(() => {
    if (!clue || !hydrated) return;
    const text = clue.crypticText;
    let index = 0;
    setDisplayedText("");
    setTypewriterDone(false);

    const interval = setInterval(() => {
      index++;
      setDisplayedText(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
        setTypewriterDone(true);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [clue, hydrated]);

  if (!hydrated || !faction || !clue) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleNext = () => {
    if (isFinalUnlocked()) {
      router.push("/final");
    } else if (nextFaction) {
      router.push(`/game/${nextFaction.slug}`);
    } else {
      router.push("/final");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-dvh flex flex-col safe-padding">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 z-20">
          <div className="flex-1">
            <ProgressBar />
          </div>
          <div className="ml-3">
            <MuteToggle />
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md w-full flex flex-col items-center gap-8"
          >
            {/* Faction badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: `${faction.color}20`,
                border: `2px solid ${faction.color}44`,
              }}
            >
              <span
                className="text-2xl font-black"
                style={{ color: faction.color }}
              >
                {clue.order}
              </span>
            </motion.div>

            {/* Title */}
            <div className="text-center">
              <h2
                className="text-xl font-bold mb-1"
                style={{ color: faction.color }}
              >
                Indice des {faction.name}
              </h2>
              <p className="text-foreground/40 text-xs">
                Épreuve {clue.order}/5 complétée
              </p>
            </div>

            {/* Clue text with typewriter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-full p-6 rounded-xl border"
              style={{
                borderColor: `${faction.color}33`,
                backgroundColor: `${faction.color}08`,
              }}
            >
              <p className="font-mono text-sm leading-relaxed text-foreground/80">
                <span className={typewriterDone ? "" : "typewriter-cursor"}>
                  {displayedText}
                </span>
              </p>
            </motion.div>

            {/* Hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: typewriterDone ? 0.5 : 0 }}
              className="text-xs text-foreground/40 text-center italic"
            >
              Mémorise bien cet indice. Tu en auras besoin à la fin.
            </motion.p>

            {/* Next button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: typewriterDone ? 1 : 0,
                y: typewriterDone ? 0 : 20,
              }}
              transition={{ duration: 0.4 }}
            >
              <Button
                onClick={handleNext}
                variant="faction"
                factionColor={faction.color}
                size="lg"
                disabled={!typewriterDone}
              >
                {isFinalUnlocked()
                  ? "Épreuve finale \u2192"
                  : nextFaction
                    ? `Épreuve suivante : ${nextFaction.name} \u2192`
                    : "Épreuve finale \u2192"}
              </Button>
            </motion.div>
          </motion.div>
        </main>

        {/* Bottom glow */}
        <div
          className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none z-0"
          style={{
            background: `radial-gradient(ellipse at center bottom, ${faction.color}15, transparent 70%)`,
          }}
        />
      </div>
    </PageTransition>
  );
}
