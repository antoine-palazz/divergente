"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LivesDisplayProps {
  lives: number;
  maxLives: number;
}

export default function LivesDisplay({ lives, maxLives }: LivesDisplayProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: maxLives }).map((_, i) => (
        <AnimatePresence key={i} mode="popLayout">
          {i < lives ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0, rotate: -45 }}
              className="text-xl"
            >
              ❤️
            </motion.span>
          ) : (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1, opacity: 0.3 }}
              className="text-xl grayscale"
            >
              🖤
            </motion.span>
          )}
        </AnimatePresence>
      ))}
    </div>
  );
}
