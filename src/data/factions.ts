import { Faction } from "@/types";

export const FACTIONS: Faction[] = [
  {
    slug: "audacieux",
    name: "Audacieux",
    subtitle: "L'épreuve du courage",
    description:
      "Les Audacieux valorisent le courage, la bravoure et l'action. Prouve tes réflexes pour survivre à cette épreuve.",
    color: "#ef4444",
    colorClass: "text-audacieux",
    bgClass: "bg-audacieux",
    gameOrder: 1,
  },
  {
    slug: "erudits",
    name: "Érudits",
    subtitle: "L'épreuve de l'intellect",
    description:
      "Les Érudits recherchent la connaissance et la logique. Réponds vite et bien pour prouver ton intelligence.",
    color: "#3b82f6",
    colorClass: "text-erudits",
    bgClass: "bg-erudits",
    gameOrder: 2,
  },
  {
    slug: "sinceres",
    name: "Sincères",
    subtitle: "L'épreuve de la vérité",
    description:
      "Les Sincères ne tolèrent que la vérité. Sépare le vrai du faux avant que le temps ne s'écoule.",
    color: "#e5e7eb",
    colorClass: "text-sinceres",
    bgClass: "bg-sinceres",
    gameOrder: 3,
  },
  {
    slug: "fraternels",
    name: "Fraternels",
    subtitle: "L'épreuve de l'harmonie",
    description:
      "Les Fraternels croient en l'harmonie et la coordination. Synchronise tes actions avec précision.",
    color: "#f59e0b",
    colorClass: "text-fraternels",
    bgClass: "bg-fraternels",
    gameOrder: 4,
  },
  {
    slug: "altruistes",
    name: "Altruistes",
    subtitle: "L'épreuve du sacrifice",
    description:
      "Les Altruistes se sacrifient pour les autres. Trouve le chemin optimal en acceptant de perdre pour gagner.",
    color: "#9ca3af",
    colorClass: "text-altruistes",
    bgClass: "bg-altruistes",
    gameOrder: 5,
  },
];

export const GAME_ORDER: string[] = [
  "audacieux",
  "erudits",
  "sinceres",
  "fraternels",
  "altruistes",
];

export function getFaction(slug: string): Faction | undefined {
  return FACTIONS.find((f) => f.slug === slug);
}

export function getNextFaction(slug: string): Faction | undefined {
  const current = FACTIONS.find((f) => f.slug === slug);
  if (!current) return undefined;
  return FACTIONS.find((f) => f.gameOrder === current.gameOrder + 1);
}
