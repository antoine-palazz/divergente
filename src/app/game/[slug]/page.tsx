import { GAME_ORDER } from "@/data/factions";
import GamePageClient from "./GamePageClient";

export function generateStaticParams() {
  return GAME_ORDER.map((slug) => ({ slug }));
}

export default function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <GamePageClient params={params} />;
}
