import { Difficulty } from '../types/sudoku';
import { countSolutions, getCandidates, isValid, solveSudoku } from './sudokuSolver';

// Clue counts per difficulty
const CLUE_COUNTS: Record<Difficulty, number> = {
  easy: 40,
  medium: 34,
  hard: 29,
  expert: 25,
  evil: 22,
};

// High quality curated seeds for fast fallback or daily challenges
export const SEED_PUZZLES: Record<Difficulty, { puzzle: string; solution: string }> = {
  easy: {
    puzzle: '109040000070003608060078000045096182032000765608507900856000009401065820000480010',
    solution: '189642357274153698563978241745396182932814765618527934856231479491765823327489516',
  },
  medium: {
    puzzle: '008240007600510003030000400010005000420300005005902046703100090580000370091830004',
    solution: '958243617647518923132796458816475239429361785375982146763154892584629371291837564',
  },
  hard: {
    puzzle: '305080000000710500014050086080900000539467000062000400050043000003000012800000000',
    solution: '395286741628714593714359286487921635539467128162538479251843967943675812876192354',
  },
  expert: {
    puzzle: '740000100000000029390000760000039007030000000200507004050010000600800000008703901',
    solution: '746928135185376429392154768514239687837641592269587314953412876671895243428763951',
  },
  evil: {
    puzzle: '008007000400100002000050300007208000000000029605000070000000004000020058031400000',
    solution: '218347596453196782976852341397268415184735629625914873862571934749623158531489267',
  },
};

function createEmptyGrid(): number[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate a random valid solved board
export function generateSolvedBoard(): number[][] {
  const board = createEmptyGrid();

  function fill(): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (const num of numbers) {
            if (isValid(board, r, c, num)) {
              board[r][c] = num;
              if (fill()) return true;
              board[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  fill();
  return board;
}

/**
 * Generate a Sudoku puzzle with target difficulty and guaranteed unique solution.
 */
export function generateSudoku(difficulty: Difficulty): { initialBoard: number[][]; solution: number[][] } {
  const solution = generateSolvedBoard();
  const puzzle = solution.map(row => [...row]);

  const targetClues = CLUE_COUNTS[difficulty];
  const targetRemovals = 81 - targetClues;

  // Create list of all cell positions and shuffle them
  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }
  const shuffledPositions = shuffle(positions);

  let removedCount = 0;

  for (const [r, c] of shuffledPositions) {
    if (removedCount >= targetRemovals) break;

    const backup = puzzle[r][c];
    puzzle[r][c] = 0;

    // Check if unique solution remains
    if (countSolutions(puzzle, 2) === 1) {
      removedCount++;
    } else {
      // Restore
      puzzle[r][c] = backup;
    }
  }

  // Double check uniqueness
  if (countSolutions(puzzle, 2) !== 1) {
    // Fall back to pre-tested seed if edge case encountered
    const seed = SEED_PUZZLES[difficulty];
    return parsePuzzleString(seed.puzzle, seed.solution);
  }

  return { initialBoard: puzzle, solution };
}

export function parsePuzzleString(puzzleStr: string, solutionStr?: string): { initialBoard: number[][]; solution: number[][] } {
  const initialBoard = createEmptyGrid();
  for (let i = 0; i < 81; i++) {
    const r = Math.floor(i / 9);
    const c = i % 9;
    const char = puzzleStr[i] || '0';
    initialBoard[r][c] = char >= '1' && char <= '9' ? parseInt(char, 10) : 0;
  }

  let solutionBoard: number[][];
  if (solutionStr && solutionStr.length === 81) {
    solutionBoard = createEmptyGrid();
    for (let i = 0; i < 81; i++) {
      const r = Math.floor(i / 9);
      const c = i % 9;
      solutionBoard[r][c] = parseInt(solutionStr[i], 10);
    }
  } else {
    const solved = solveSudoku(initialBoard);
    solutionBoard = solved.solution;
  }

  return { initialBoard, solution: solutionBoard };
}

export function boardToString(board: number[][]): string {
  return board.map(row => row.join('')).join('');
}
