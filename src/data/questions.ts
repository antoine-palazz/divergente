import { QuizQuestion } from "@/types";

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question:
      "Dans un groupe de 5 personnes, chacun serre la main de tous les autres. Combien de poignées de main au total ?",
    options: ["10", "15", "20", "25"],
    correctIndex: 0,
  },
  {
    id: 2,
    question:
      "Un leader doit-il toujours suivre la majorité pour être considéré comme juste ?",
    options: [
      "Oui, la démocratie prime",
      "Non, la justice dépasse le nombre",
      "Seulement en temps de paix",
      "La question est sans réponse",
    ],
    correctIndex: 1,
  },
  {
    id: 3,
    question: "Quel est le prochain nombre : 2, 6, 12, 20, 30, ... ?",
    options: ["40", "42", "44", "36"],
    correctIndex: 1,
  },
  {
    id: 4,
    question:
      "Si tous les Érudits sont intelligents et certains intelligents sont courageux, peut-on dire que certains Érudits sont courageux ?",
    options: [
      "Oui, certainement",
      "Non, c'est impossible",
      "On ne peut pas conclure",
      "Seulement si on le prouve",
    ],
    correctIndex: 2,
  },
  {
    id: 5,
    question:
      "Un sérum de vérité est administré à 100 personnes. 95 disent la vérité. Combien mentent ?",
    options: [
      "5, par définition",
      "0, le sérum est infaillible",
      "On ne peut pas savoir",
      "Entre 0 et 5",
    ],
    correctIndex: 0,
  },
  {
    id: 6,
    question: "Quel mot ne correspond PAS aux autres : Peur, Courage, Lâcheté, Terreur ?",
    options: ["Peur", "Courage", "Lâcheté", "Terreur"],
    correctIndex: 1,
  },
  {
    id: 7,
    question:
      "Une horloge sonne 6 coups en 5 secondes. Combien de temps pour sonner 12 coups ?",
    options: ["10 secondes", "11 secondes", "12 secondes", "5,5 secondes"],
    correctIndex: 1,
  },
  {
    id: 8,
    question:
      "Dans une société divisée en factions, quel est le plus grand danger ?",
    options: [
      "L'ignorance",
      "La division elle-même",
      "Le manque de ressources",
      "L'absence de leader",
    ],
    correctIndex: 1,
  },
  {
    id: 9,
    question:
      "Un train part de A à 60 km/h, un autre de B à 90 km/h. A et B sont distants de 300 km. Où se croisent-ils (depuis A) ?",
    options: ["120 km", "150 km", "180 km", "200 km"],
    correctIndex: 0,
  },
  {
    id: 10,
    question:
      "Complète la séquence : U, D, T, Q, C, S, S, ... ?",
    options: ["H", "E", "N", "D"],
    correctIndex: 0,
  },
  {
    id: 11,
    question:
      "Est-il éthique de sacrifier une personne pour en sauver cinq ?",
    options: [
      "Oui, le plus grand bien prime",
      "Non, toute vie est sacrée",
      "Cela dépend du contexte",
      "C'est un faux dilemme",
    ],
    correctIndex: 2,
  },
  {
    id: 12,
    question:
      "Deux pères et deux fils vont pêcher. Ils attrapent 3 poissons, un chacun. Comment ?",
    options: [
      "Un a relâché le sien",
      "Ils sont trois : grand-père, père, fils",
      "Un poisson est partagé",
      "C'est impossible",
    ],
    correctIndex: 1,
  },
  {
    id: 13,
    question: "Quel est l'antonyme de « divergent » ?",
    options: ["Convergent", "Parallèle", "Identique", "Uniforme"],
    correctIndex: 0,
  },
  {
    id: 14,
    question:
      "Si A est vrai quand B est faux, et B est vrai quand C est vrai, que peut-on dire quand C est faux ?",
    options: [
      "A est vrai",
      "A est faux",
      "B est faux, donc A est vrai",
      "On ne peut rien conclure",
    ],
    correctIndex: 2,
  },
  {
    id: 15,
    question:
      "Quel chiffre remplace le ? : 1, 1, 2, 3, 5, 8, ?",
    options: ["11", "12", "13", "15"],
    correctIndex: 2,
  },
  {
    id: 16,
    question:
      "La connaissance sans action est-elle utile ?",
    options: [
      "Oui, savoir a une valeur intrinsèque",
      "Non, seule l'action compte",
      "Elle est nécessaire mais insuffisante",
      "Cela dépend du domaine",
    ],
    correctIndex: 2,
  },
];
