"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";

export default function MuteToggle() {
  const isMuted = useGameStore((s) => s.isMuted);
  const toggleMute = useGameStore((s) => s.toggleMute);

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggleMute}
      className="p-2 rounded-lg bg-foreground/5 border border-foreground/10 
                 hover:bg-foreground/10 transition-colors cursor-pointer"
      aria-label={isMuted ? "Activer le son" : "Couper le son"}
      title={isMuted ? "Activer le son" : "Couper le son"}
    >
      <span className="text-lg">{isMuted ? "🔇" : "🔊"}</span>
    </motion.button>
  );
}
