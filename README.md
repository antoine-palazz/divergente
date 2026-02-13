# Divergente — L'Épreuve des Factions

Un site web de mini-jeux progressifs inspiré de l'univers de Divergente, conçu comme une chasse au trésor immersive.

## Concept

Le joueur est identifié comme un(e) potentiel(le) Divergent(e). Chaque mini-jeu représente une épreuve inspirée des cinq factions :

1. **Audacieux** — Épreuve de réflexes (esquive d'obstacles)
2. **Érudits** — Puzzle logique chronométré
3. **Sincères** — Détection de vérité (vrai/faux)
4. **Fraternels** — Coordination de précision
5. **Altruistes** — Puzzle stratégique de sacrifice

Chaque épreuve réussie débloque un indice cryptique. Les 5 indices combinés forment la réponse finale.

## Stack technique

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4**
- **Framer Motion** (animations)
- **Zustand** (state management)
- **Web Audio API** (effets sonores)
- **LocalStorage** (sauvegarde de progression)

## Lancer en local

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Ouvrir http://localhost:3000
```

## Build de production

```bash
npm run build
npm start
```

## Structure du projet

```
src/
  app/               # Routes Next.js (App Router)
    page.tsx          # Page d'accueil
    game/[slug]/      # Pages des mini-jeux
    clue/[slug]/      # Pages de révélation des indices
    final/            # Page du puzzle final
  components/
    ui/               # Composants réutilisables (boutons, timer, etc.)
    layout/           # Layout et gardes de navigation
    effects/          # Effets visuels (particules, transitions)
  games/              # Les 5 mini-jeux
  store/              # État global (Zustand)
  data/               # Données (questions, indices, niveaux)
  utils/              # Utilitaires (son, stockage)
  hooks/              # Hooks personnalisés
  types/              # Types TypeScript
```

## Fonctionnalités

- Progression séquentielle verrouillée
- Sauvegarde automatique (LocalStorage)
- Effets sonores Web Audio API (toggle mute)
- Responsive : mobile, tablette, desktop
- Contrôles tactiles et clavier
- Animations Framer Motion
- Fond de particules interactif
- Difficulté progressive dans chaque jeu

## Le Maître du Jeu

Antoine
