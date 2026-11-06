export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'evil';

export type InputMode = 'cell-first' | 'digit-first';

export type ThemeId = 'oled' | 'paper' | 'neon' | 'matcha' | 'indigo';

export interface CellPosition {
  row: number;
  col: number;
}

export interface SudokuCell {
  row: number;
  col: number;
  value: number; // 0 for empty, 1-9
  solution: number; // 1-9
  isGiven: boolean; // Pre-filled clue
  isError: boolean;
  notes: number[]; // Array of 1-9 pencil marks
  colorTag?: string; // Optional master color highlight (e.g., #3b82f6)
}

export type SudokuBoard = SudokuCell[][];

export interface HintStep {
  type: 'naked-single' | 'hidden-single' | 'naked-pair' | 'pointing-pair' | 'elimination' | 'direct';
  title: string;
  explanation: string;
  targetCell: CellPosition;
  recommendedValue: number;
  highlightCells: CellPosition[]; // Cells involved in the logic
  eliminatedCandidates?: { row: number; col: number; val: number }[];
  highlightType: 'row' | 'col' | 'box' | 'pair' | 'cell';
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  bestTimeSeconds: Record<Difficulty, number | null>;
  totalTimeSeconds: number;
  currentStreak: number;
  bestStreak: number;
  hintsUsedCount: number;
  perfectGamesCount: number; // No mistakes
}

export interface GameSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  autoRemoveNotes: boolean;
  highlightDuplicates: boolean;
  highlightRelated: boolean;
  highlightSameDigit: boolean;
  inputMode: InputMode;
  theme: ThemeId;
  maxMistakes: number; // 3 or 0 for infinite/casual
  showTimer: boolean;
}

export interface MoveHistory {
  board: SudokuBoard;
  mistakes: number;
  description: string;
}
