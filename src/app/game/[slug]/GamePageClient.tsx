"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import GameGuard from "@/components/layout/GameGuard";
import GameLayout from "@/components/layout/GameLayout";
import { getFaction } from "@/data/factions";
import { FactionSlug } from "@/types";
import AudacieuxGame from "@/games/AudacieuxGame";
import EruditsGame from "@/games/EruditsGame";
import SinceresGame from "@/games/SinceresGame";
import FraternelsGame from "@/games/FraternelsGame";
import AltruistesGame from "@/games/AltruistesGame";

const GAME_COMPONENTS: Record<FactionSlug, React.ComponentType> = {
  audacieux: AudacieuxGame,
  erudits: EruditsGame,
  sinceres: SinceresGame,
  fraternels: FraternelsGame,
  altruistes: AltruistesGame,
};

export default function GamePageClient({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const faction = getFaction(slug);

  if (!faction) {
    notFound();
  }

  const GameComponent = GAME_COMPONENTS[slug as FactionSlug];
  if (!GameComponent) {
    notFound();
  }

  return (
    <GameGuard slug={slug as FactionSlug}>
      <GameLayout factionColor={faction.color}>
        <GameComponent />
      </GameLayout>
    </GameGuard>
  );
}
