"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore, hydrateStore } from "@/store/gameStore";
import { FactionSlug } from "@/types";

interface GameGuardProps {
  slug: FactionSlug;
  children: React.ReactNode;
}

export default function GameGuard({ slug, children }: GameGuardProps) {
  const router = useRouter();
  const isGameUnlocked = useGameStore((s) => s.isGameUnlocked);
  const hasStarted = useGameStore((s) => s.hasStarted);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    hydrateStore();
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!hasStarted || !isGameUnlocked(slug)) {
      router.replace("/");
    }
  }, [hydrated, hasStarted, slug, isGameUnlocked, router]);

  if (!hydrated) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasStarted || !isGameUnlocked(slug)) {
    return null;
  }

  return <>{children}</>;
}
