"use client";

import { motion } from "framer-motion";
import { FACTIONS } from "@/data/factions";
import { useGameStore } from "@/store/gameStore";

export default function ProgressBar() {
  const completedGames = useGameStore((s) => s.completedGames);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center gap-1">
        {FACTIONS.map((faction, i) => {
          const isCompleted = completedGames.includes(faction.slug);
          return (
            <div key={faction.slug} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: `${faction.color}20` }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: faction.color }}
                  initial={{ width: 0 }}
                  animate={{ width: isCompleted ? "100%" : "0%" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                />
              </motion.div>
              <span
                className="text-[10px] font-medium opacity-60 hidden sm:block"
                style={{ color: faction.color }}
              >
                {faction.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
