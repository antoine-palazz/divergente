"use client";

import ProgressBar from "@/components/ui/ProgressBar";
import MuteToggle from "@/components/ui/MuteToggle";
import PageTransition from "@/components/effects/PageTransition";
import { cn } from "@/utils/cn";

interface GameLayoutProps {
  children: React.ReactNode;
  factionColor?: string;
  className?: string;
  showProgress?: boolean;
}

export default function GameLayout({
  children,
  factionColor,
  className,
  showProgress = true,
}: GameLayoutProps) {
  return (
    <PageTransition>
      <div
        className={cn(
          "min-h-dvh flex flex-col safe-padding",
          className
        )}
      >
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 z-20">
          <div className="flex-1">
            {showProgress && <ProgressBar />}
          </div>
          <div className="ml-3">
            <MuteToggle />
          </div>
        </header>

        {/* Game content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 pb-6 z-10 relative">
          {children}
        </main>

        {/* Subtle bottom glow */}
        {factionColor && (
          <div
            className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none z-0"
            style={{
              background: `radial-gradient(ellipse at center bottom, ${factionColor}15, transparent 70%)`,
            }}
          />
        )}
      </div>
    </PageTransition>
  );
}
