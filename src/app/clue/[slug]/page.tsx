import { GAME_ORDER } from "@/data/factions";
import CluePageClient from "./CluePageClient";

export function generateStaticParams() {
  return GAME_ORDER.map((slug) => ({ slug }));
}

export default function CluePage() {
  return <CluePageClient />;
}
