"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

interface TimerProps {
  timeLeft: number;
  maxTime?: number;
  danger?: boolean;
  className?: string;
}

export default function Timer({
  timeLeft,
  maxTime,
  danger = false,
  className,
}: TimerProps) {
  const isLow = timeLeft <= 10;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = minutes > 0
    ? `${minutes}:${seconds.toString().padStart(2, "0")}`
    : `${seconds}s`;

  const percentage = maxTime ? (timeLeft / maxTime) * 100 : undefined;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={timeLeft}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "font-mono text-2xl font-bold tabular-nums",
            isLow || danger ? "text-danger" : "text-foreground"
          )}
        >
          {display}
        </motion.div>
      </AnimatePresence>
      {percentage !== undefined && (
        <div className="w-24 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              isLow || danger ? "bg-danger" : "bg-primary"
            )}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </div>
  );
}
