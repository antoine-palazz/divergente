"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { useSound } from "@/hooks/useSound";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "danger" | "success" | "ghost" | "faction";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  factionColor?: string;
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className,
  factionColor,
}: ButtonProps) {
  const { play } = useSound();

  const handleClick = () => {
    if (disabled) return;
    play("click");
    onClick?.();
  };

  const baseClasses =
    "relative font-semibold rounded-lg transition-all duration-200 no-select cursor-pointer";

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const variantClasses = {
    primary:
      "bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 active:bg-primary/40",
    danger:
      "bg-danger/20 text-danger border border-danger/40 hover:bg-danger/30 active:bg-danger/40",
    success:
      "bg-success/20 text-success border border-success/40 hover:bg-success/30 active:bg-success/40",
    ghost:
      "bg-transparent text-foreground/70 border border-foreground/20 hover:bg-foreground/10 active:bg-foreground/20",
    faction: "",
  };

  const factionStyle =
    variant === "faction" && factionColor
      ? {
          backgroundColor: `${factionColor}20`,
          color: factionColor,
          borderColor: `${factionColor}66`,
          borderWidth: "1px",
        }
      : {};

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
      style={factionStyle}
    >
      {children}
    </motion.button>
  );
}
