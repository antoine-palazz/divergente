import { PuzzleLevel, CellType } from "@/types";

// Legend:
// E = empty, W = wall, S = start, G = goal, X = sacrifice (-1 move), B = bonus (+1 move)
const _: CellType = "empty";
const W: CellType = "wall";
const S: CellType = "start";
const G: CellType = "goal";
const X: CellType = "sacrifice";
const B: CellType = "bonus";

export const PUZZLE_LEVELS: PuzzleLevel[] = [
  // Level 1: Introduction - 6x6, easy path with one sacrifice choice
  {
    id: 1,
    grid: [
      [S, _, _, W, _, _],
      [_, W, _, _, _, W],
      [_, _, X, _, W, _],
      [W, _, _, _, _, _],
      [_, _, W, _, X, _],
      [_, _, _, W, _, G],
    ],
    maxMoves: 12,
    startX: 0,
    startY: 0,
    goalX: 5,
    goalY: 5,
  },
  // Level 2: Medium - more walls, sacrifice tiles, need planning
  {
    id: 2,
    grid: [
      [S, _, W, _, _, _],
      [_, W, _, X, _, W],
      [_, _, _, W, _, _],
      [W, X, _, _, W, _],
      [_, _, W, _, _, _],
      [_, W, _, _, X, G],
    ],
    maxMoves: 11,
    startX: 0,
    startY: 0,
    goalX: 5,
    goalY: 5,
  },
  // Level 3: Hard - tight moves, one optimal path (10 moves)
  // Optimal: (0,0)→(1,0)→(1,1)→(1,2)→(2,2)→(3,2)→(3,3)→(4,3)→(4,4)→(5,4)→(5,5)
  // Sacrifice at (2,4) tempts a shortcut that costs too much
  {
    id: 3,
    grid: [
      [S, _, _, W, _, _],
      [_, _, W, _, _, W],
      [W, _, _, _, W, _],
      [_, W, _, _, _, _],
      [_, _, X, W, _, _],
      [_, _, _, _, _, G],
    ],
    maxMoves: 10,
    startX: 0,
    startY: 0,
    goalX: 5,
    goalY: 5,
  },
];
