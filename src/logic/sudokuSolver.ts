/**
 * Pure Sudoku Solver and Candidate Analysis
 */

export function isValid(grid: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c] === num) return false;
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col] === num) return false;
  }

  // Check 3x3 box
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const curRow = startRow + r;
      const curCol = startCol + c;
      if ((curRow !== row || curCol !== col) && grid[curRow][curCol] === num) {
        return false;
      }
    }
  }

  return true;
}

export function solveSudoku(grid: number[][]): { solved: boolean; solution: number[][] } {
  const board = grid.map(r => [...r]);

  function solve(): boolean {
    let emptyRow = -1;
    let emptyCol = -1;
    let minCandidateCount = 10;
    let bestCandidates: number[] = [];

    // MRV heuristic (Minimum Remaining Values) for lightning fast solving
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          const candidates = getCandidates(board, r, c);
          if (candidates.length < minCandidateCount) {
            minCandidateCount = candidates.length;
            emptyRow = r;
            emptyCol = c;
            bestCandidates = candidates;
            if (minCandidateCount === 0) return false; // Dead end
            if (minCandidateCount === 1) break;
          }
        }
      }
      if (minCandidateCount === 1) break;
    }

    if (emptyRow === -1) {
      return true; // All filled!
    }

    for (const num of bestCandidates) {
      board[emptyRow][emptyCol] = num;
      if (solve()) return true;
      board[emptyRow][emptyCol] = 0;
    }

    return false;
  }

  const solved = solve();
  return { solved, solution: board };
}

export function countSolutions(grid: number[][], limit = 2): number {
  const board = grid.map(r => [...r]);
  let count = 0;

  function backtrack(): boolean {
    let emptyRow = -1;
    let emptyCol = -1;
    let minCandidates = 10;
    let candidatesList: number[] = [];

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          const cand = getCandidates(board, r, c);
          if (cand.length < minCandidates) {
            minCandidates = cand.length;
            emptyRow = r;
            emptyCol = c;
            candidatesList = cand;
            if (minCandidates === 0) return false;
            if (minCandidates === 1) break;
          }
        }
      }
      if (minCandidates === 1) break;
    }

    if (emptyRow === -1) {
      count++;
      return count >= limit;
    }

    for (const num of candidatesList) {
      board[emptyRow][emptyCol] = num;
      if (backtrack()) return true;
      board[emptyRow][emptyCol] = 0;
    }

    return false;
  }

  backtrack();
  return count;
}

export function getCandidates(grid: number[][], row: number, col: number): number[] {
  if (grid[row][col] !== 0) return [];
  const candidates: number[] = [];
  for (let num = 1; num <= 9; num++) {
    if (isValid(grid, row, col, num)) {
      candidates.push(num);
    }
  }
  return candidates;
}

export function isBoardValid(grid: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (val !== 0 && !isValid(grid, r, c, val)) {
        return false;
      }
    }
  }
  return true;
}

export function isBoardComplete(grid: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0 || !isValid(grid, r, c, grid[r][c])) {
        return false;
      }
    }
  }
  return true;
}
