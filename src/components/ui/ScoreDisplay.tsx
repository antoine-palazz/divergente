"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

interface ScoreDisplayProps {
  score: number;
  total?: number;
  label?: string;
  className?: string;
}

export default function ScoreDisplay({
  score,
  total,
  label = "Score",
  className,
}: ScoreDisplayProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <span className="text-xs text-foreground/50 uppercase tracking-wider">
        {label}
      </span>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={score}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-bold font-mono tabular-nums"
        >
          {score}
          {total !== undefined && (
            <span className="text-foreground/40">/{total}</span>
          )}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
