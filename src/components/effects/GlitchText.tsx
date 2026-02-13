"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export default function GlitchText({
  text,
  className,
  as: Tag = "h1",
}: GlitchTextProps) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Tag className={cn("relative z-10", className)}>{text}</Tag>
      {/* Glitch layers */}
      <Tag
        className={cn(
          "absolute inset-0 z-0 opacity-70",
          className
        )}
        style={{
          color: "#4a9eff",
          clipPath: "inset(10% 0 60% 0)",
          transform: "translate(-2px, -1px)",
        }}
        aria-hidden="true"
      >
        {text}
      </Tag>
      <Tag
        className={cn(
          "absolute inset-0 z-0 opacity-70",
          className
        )}
        style={{
          color: "#dc2626",
          clipPath: "inset(60% 0 10% 0)",
          transform: "translate(2px, 1px)",
        }}
        aria-hidden="true"
      >
        {text}
      </Tag>
    </motion.div>
  );
}
