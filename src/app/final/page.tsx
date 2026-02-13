"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, hydrateStore } from "@/store/gameStore";
import { CLUES, FINAL_ANSWER } from "@/data/clues";
import { FACTIONS } from "@/data/factions";
import GlitchText from "@/components/effects/GlitchText";
import Button from "@/components/ui/Button";
import MuteToggle from "@/components/ui/MuteToggle";
import { useSound } from "@/hooks/useSound";

type Phase = "puzzle" | "success" | "celebration";

export default function FinalPage() {
  const router = useRouter();
  const { play } = useSound();
  const [hydrated, setHydrated] = useState(false);
  const [phase, setPhase] = useState<Phase>("puzzle");
  const [answer, setAnswer] = useState("");
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isFinalUnlocked = useGameStore((s) => s.isFinalUnlocked);
  const unlockedClues = useGameStore((s) => s.unlockedClues);

  useEffect(() => {
    hydrateStore();
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !isFinalUnlocked()) {
      router.replace("/");
    }
  }, [hydrated, isFinalUnlocked, router]);

  const handleSubmit = () => {
    const normalized = answer.trim().toLowerCase().replace(/^https?:\/\//, "");
    const target = FINAL_ANSWER.toLowerCase();

    if (normalized === target) {
      setPhase("success");
      play("success");
      setTimeout(() => setPhase("celebration"), 2000);
    } else {
      setShake(true);
      setAttempts((prev) => prev + 1);
      play("failure");
      setTimeout(() => setShake(false), 500);
      if (attempts >= 2) setShowHint(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  if (!hydrated) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col safe-padding relative overflow-hidden">
      {/* Mute toggle */}
      <div className="fixed top-4 right-4 z-50">
        <MuteToggle />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          {phase === "puzzle" && (
            <motion.div
              key="puzzle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-lg w-full flex flex-col items-center gap-6"
            >
              <GlitchText
                text="ÉPREUVE FINALE"
                className="text-3xl sm:text-4xl font-black tracking-wider text-foreground"
              />

              <p className="text-foreground/50 text-sm text-center max-w-sm">
                Tu as rassemblé les indices des cinq factions. Combine-les pour
                découvrir le secret final.
              </p>

              {/* Clue cards */}
              <div className="w-full space-y-3">
                {CLUES.map((clue, i) => {
                  const faction = FACTIONS.find((f) => f.slug === clue.slug);
                  const isUnlocked = !!unlockedClues[clue.slug];

                  return (
                    <motion.div
                      key={clue.slug}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="p-4 rounded-xl border"
                      style={{
                        borderColor: isUnlocked
                          ? `${faction?.color}44`
                          : "rgba(255,255,255,0.05)",
                        backgroundColor: isUnlocked
                          ? `${faction?.color}08`
                          : "transparent",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="text-xs font-bold px-2 py-1 rounded shrink-0"
                          style={{
                            backgroundColor: `${faction?.color}20`,
                            color: faction?.color,
                          }}
                        >
                          {clue.order}
                        </span>
                        <div>
                          <p
                            className="text-xs font-semibold mb-1"
                            style={{ color: faction?.color }}
                          >
                            {faction?.name}
                          </p>
                          <p className="text-foreground/70 text-xs font-mono leading-relaxed">
                            {isUnlocked
                              ? unlockedClues[clue.slug]
                              : "???"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Answer input */}
              <motion.div
                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                <label className="block text-xs text-foreground/40 mb-2 text-center">
                  Combine les indices pour former l&apos;adresse secrète
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tape ta réponse ici..."
                  className="w-full px-4 py-3 rounded-xl border bg-surface text-foreground font-mono text-sm 
                             border-foreground/20 focus:border-primary focus:outline-none 
                             focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-foreground/20"
                  autoComplete="off"
                  spellCheck={false}
                />
              </motion.div>

              {/* Hint */}
              {showHint && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-foreground/30 text-center italic"
                >
                  Indice : Les mots en MAJUSCULES de chaque indice forment des
                  fragments. Assemble-les en une adresse web, séparés par des
                  points et des barres obliques...
                </motion.p>
              )}

              <Button onClick={handleSubmit} size="lg">
                Vérifier
              </Button>

              {attempts > 0 && (
                <p className="text-danger text-xs">
                  Ce n&apos;est pas la bonne réponse. ({attempts}{" "}
                  tentative{attempts > 1 ? "s" : ""})
                </p>
              )}
            </motion.div>
          )}

          {phase === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 text-center"
            >
              {/* Expanding rings */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-primary/30"
                  initial={{ width: 0, height: 0, opacity: 1 }}
                  animate={{
                    width: 600 + i * 200,
                    height: 600 + i * 200,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3,
                    ease: "easeOut",
                  }}
                />
              ))}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1] }}
                transition={{ duration: 1 }}
                className="text-8xl"
              >
                ⚡
              </motion.div>
            </motion.div>
          )}

          {phase === "celebration" && (
            <motion.div
              key="celebration"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-lg w-full flex flex-col items-center gap-8 text-center"
            >
              <GlitchText
                text="TU ES DIVERGENT(E)"
                className="text-3xl sm:text-5xl font-black tracking-widest text-primary"
              />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <p className="text-foreground/70 text-lg leading-relaxed">
                  Tu as prouvé que tu n&apos;appartiens à aucune faction unique.
                </p>
                <p className="text-foreground/50 text-sm leading-relaxed">
                  Courage, intelligence, honnêteté, harmonie et sacrifice —
                  toutes ces qualités coexistent en toi. C&apos;est ce qui fait ta
                  force. La solution, c&apos;est la cohésion.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="p-6 rounded-xl border border-secondary/30 bg-secondary/5"
              >
                <p className="text-secondary text-sm italic leading-relaxed">
                  &ldquo;Ce qui te rend différent(e) te rend dangereux(se). Et ce
                  qui te rend dangereux(se), c&apos;est que tu ne peux pas être
                  contrôlé(e).&rdquo;
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="space-y-2"
              >
                <p className="text-foreground/40 text-sm">
                  Le trésor a été révélé. Rends-toi à l&apos;adresse :
                </p>
                <p className="font-mono text-primary font-bold text-lg">
                  {FINAL_ANSWER}
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="text-foreground/30 text-xs italic"
              >
                — Le Maître du Jeu, Antoine
              </motion.p>

              {/* Faction emblems */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="flex gap-3"
              >
                {FACTIONS.map((f, i) => (
                  <motion.div
                    key={f.slug}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 2.5 + i * 0.15, type: "spring" }}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: `${f.color}20`,
                      color: f.color,
                      border: `1px solid ${f.color}44`,
                    }}
                  >
                    ✓
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
              >
                <Button
                  onClick={() => router.push("/")}
                  variant="ghost"
                  size="md"
                >
                  Retour à l&apos;accueil
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
