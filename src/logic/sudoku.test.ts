import test from 'node:test';
import assert from 'node:assert/strict';
import { isValid, solveSudoku, countSolutions, getCandidates, isBoardComplete } from './sudokuSolver';
import { generateSudoku, parsePuzzleString, SEED_PUZZLES } from './sudokuGenerator';
import { getSmartHint } from './hintEngine';
import { SudokuBoard } from '../types/sudoku';

test('sudokuSolver: validates numbers in row, col, and 3x3 box', () => {
  const emptyGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
  emptyGrid[0][0] = 5;

  // Same row should be invalid
  assert.equal(isValid(emptyGrid, 0, 4, 5), false);
  // Same col should be invalid
  assert.equal(isValid(emptyGrid, 4, 0, 5), false);
  // Same 3x3 box should be invalid
  assert.equal(isValid(emptyGrid, 1, 1, 5), false);
  // Outside row, col, and box should be valid
  assert.equal(isValid(emptyGrid, 4, 4, 5), true);
  // Different number in same row should be valid
  assert.equal(isValid(emptyGrid, 0, 4, 3), true);
});

test('sudokuSolver: solves a known puzzle accurately', () => {
  const { puzzle, solution } = SEED_PUZZLES.easy;
  const parsed = parsePuzzleString(puzzle);
  const result = solveSudoku(parsed.initialBoard);

  assert.equal(result.solved, true);
  assert.equal(isBoardComplete(result.solution), true);

  // Compare with pre-computed solution
  const solutionParsed = parsePuzzleString(solution);
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      assert.equal(result.solution[r][c], solutionParsed.initialBoard[r][c]);
    }
  }
});

test('sudokuSolver: detects unique solutions with countSolutions', () => {
  const { puzzle } = SEED_PUZZLES.medium;
  const parsed = parsePuzzleString(puzzle);
  const solutionsCount = countSolutions(parsed.initialBoard, 2);
  assert.equal(solutionsCount, 1);
});

test('sudokuSolver: getCandidates returns only valid numbers', () => {
  const { puzzle } = SEED_PUZZLES.easy;
  const parsed = parsePuzzleString(puzzle);
  const candidates = getCandidates(parsed.initialBoard, 0, 0);

  // All returned candidates must be valid
  for (const num of candidates) {
    assert.equal(isValid(parsed.initialBoard, 0, 0, num), true);
  }
});

test('sudokuGenerator: generates valid playable puzzle with unique solution', () => {
  const generated = generateSudoku('easy');
  assert.equal(generated.initialBoard.length, 9);
  assert.equal(generated.solution.length, 9);
  assert.equal(isBoardComplete(generated.solution), true);

  // Clues count check
  let clueCount = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (generated.initialBoard[r][c] !== 0) {
        clueCount++;
        assert.equal(generated.initialBoard[r][c], generated.solution[r][c]);
      }
    }
  }
  assert.ok(clueCount >= 20, 'Should have sufficient clues');
});

test('hintEngine: identifies smart hint on an active board', () => {
  const { puzzle, solution } = SEED_PUZZLES.easy;
  const p = parsePuzzleString(puzzle);
  const s = parsePuzzleString(solution);

  // Convert to SudokuBoard format
  const board: SudokuBoard = [];
  for (let r = 0; r < 9; r++) {
    board[r] = [];
    for (let c = 0; c < 9; c++) {
      const val = p.initialBoard[r][c];
      board[r][c] = {
        row: r,
        col: c,
        value: val,
        solution: s.initialBoard[r][c],
        isGiven: val !== 0,
        isError: false,
        notes: [],
      };
    }
  }

  const hint = getSmartHint(board);
  assert.ok(hint !== null, 'Hint must be found for an incomplete board');
  assert.ok(hint.recommendedValue >= 1 && hint.recommendedValue <= 9);
  assert.equal(hint.recommendedValue, board[hint.targetCell.row][hint.targetCell.col].solution);
});
