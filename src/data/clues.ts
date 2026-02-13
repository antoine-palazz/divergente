import { Clue } from "@/types";

export const CLUES: Clue[] = [
  {
    slug: "audacieux",
    crypticText:
      "Le courage transforme ce qui est long. Retiens ceci : ce qui est long doit être rendu... COURT.",
    fragment: "short",
    order: 1,
  },
  {
    slug: "erudits",
    crypticText:
      "L'intelligence révèle les mots cachés. Observe : les caBINETS perdent leur première syllabe. Que reste-t-il ?",
    fragment: "binets",
    order: 2,
  },
  {
    slug: "sinceres",
    crypticText:
      "Le point précède la vérité. Le pays des lumières tient en deux lettres. La barre ouvre le chemin. Assemble-les : .FR/",
    fragment: ".fr/",
    order: 3,
  },
  {
    slug: "fraternels",
    crypticText:
      "L'harmonie rassemble les âmes. N'oublie pas : l'union forme LE CLUB, lié par un trait au sol.",
    fragment: "le_club_",
    order: 4,
  },
  {
    slug: "altruistes",
    crypticText:
      "Le sacrifice DES CINQ ouvre la voie finale. Retiens ces derniers mots.",
    fragment: "des_cinq",
    order: 5,
  },
];

export const FINAL_ANSWER = "short.binets.fr/le_club_des_cinq";

export function getClue(slug: string): Clue | undefined {
  return CLUES.find((c) => c.slug === slug);
}
