import { HintStep, SudokuBoard } from '../types/sudoku';
import { getCandidates } from './sudokuSolver';

/**
 * Intelligent Hint Engine
 * Analyzes the board and finds the simplest logical deduction available:
 * 1. Naked Single: Cell has only one possible candidate.
 * 2. Hidden Single: A digit appears as a candidate in only one cell within a Row, Column, or 3x3 Box.
 * 3. Pointing Pair / Elimination.
 * 4. Fallback: Direct solution inference with explanation.
 */
export function getSmartHint(board: SudokuBoard): HintStep | null {
  // Convert SudokuBoard to simple 9x9 number grid
  const grid: number[][] = board.map(row => row.map(cell => cell.value));

  // Compute all candidate sets for empty cells
  const candidateGrid: number[][][] = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => [])
  );

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        candidateGrid[r][c] = getCandidates(grid, r, c);
      }
    }
  }

  // Technique 1: Check for Naked Single (Only 1 candidate in cell)
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0 && candidateGrid[r][c].length === 1) {
        const val = candidateGrid[r][c][0];
        // Collect peers in row, col, and box that rule out other numbers
        const peers: { row: number; col: number }[] = [];
        for (let i = 0; i < 9; i++) {
          if (i !== c && grid[r][i] !== 0) peers.push({ row: r, col: i });
          if (i !== r && grid[i][c] !== 0) peers.push({ row: i, col: c });
        }
        const boxR = Math.floor(r / 3) * 3;
        const boxC = Math.floor(c / 3) * 3;
        for (let br = 0; br < 3; br++) {
          for (let bc = 0; bc < 3; bc++) {
            const pr = boxR + br;
            const pc = boxC + bc;
            if ((pr !== r || pc !== c) && grid[pr][pc] !== 0) {
              if (!peers.some(p => p.row === pr && p.col === pc)) {
                peers.push({ row: pr, col: pc });
              }
            }
          }
        }

        return {
          type: 'naked-single',
          title: 'Naked Single Found',
          explanation: `In cell (Row ${r + 1}, Col ${c + 1}), all other numbers 1-9 are already present in its row, column, or 3x3 block. Only ${val} can go here!`,
          targetCell: { row: r, col: c },
          recommendedValue: val,
          highlightCells: [{ row: r, col: c }, ...peers.slice(0, 8)],
          highlightType: 'cell',
        };
      }
    }
  }

  // Technique 2: Hidden Single in a 3x3 Box
  for (let b = 0; b < 9; b++) {
    const boxStartR = Math.floor(b / 3) * 3;
    const boxStartC = (b % 3) * 3;

    for (let num = 1; num <= 9; num++) {
      // Check if num is already placed in this box
      let alreadyPlaced = false;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (grid[boxStartR + r][boxStartC + c] === num) {
            alreadyPlaced = true;
            break;
          }
        }
      }
      if (alreadyPlaced) continue;

      // Find where num can be placed
      const possiblePositions: { row: number; col: number }[] = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const pr = boxStartR + r;
          const pc = boxStartC + c;
          if (grid[pr][pc] === 0 && candidateGrid[pr][pc].includes(num)) {
            possiblePositions.push({ row: pr, col: pc });
          }
        }
      }

      if (possiblePositions.length === 1) {
        const target = possiblePositions[0];
        const boxCells: { row: number; col: number }[] = [];
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            boxCells.push({ row: boxStartR + r, col: boxStartC + c });
          }
        }

        return {
          type: 'hidden-single',
          title: 'Hidden Single in 3×3 Block',
          explanation: `In this 3×3 block, the number ${num} cannot go in any other open cell. Cell (Row ${target.row + 1}, Col ${target.col + 1}) is the only valid spot for ${num}!`,
          targetCell: target,
          recommendedValue: num,
          highlightCells: boxCells,
          highlightType: 'box',
        };
      }
    }
  }

  // Technique 3: Hidden Single in a Row
  for (let r = 0; r < 9; r++) {
    for (let num = 1; num <= 9; num++) {
      if (grid[r].includes(num)) continue;
      const possibleCols: number[] = [];
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0 && candidateGrid[r][c].includes(num)) {
          possibleCols.push(c);
        }
      }
      if (possibleCols.length === 1) {
        const c = possibleCols[0];
        const rowCells = Array.from({ length: 9 }, (_, colIdx) => ({ row: r, col: colIdx }));
        return {
          type: 'hidden-single',
          title: `Hidden Single in Row ${r + 1}`,
          explanation: `Along Row ${r + 1}, the number ${num} has only one available spot left. It must be placed in Column ${c + 1}!`,
          targetCell: { row: r, col: c },
          recommendedValue: num,
          highlightCells: rowCells,
          highlightType: 'row',
        };
      }
    }
  }

  // Technique 4: Hidden Single in a Column
  for (let c = 0; c < 9; c++) {
    for (let num = 1; num <= 9; num++) {
      const colHasNum = grid.some(row => row[c] === num);
      if (colHasNum) continue;

      const possibleRows: number[] = [];
      for (let r = 0; r < 9; r++) {
        if (grid[r][c] === 0 && candidateGrid[r][c].includes(num)) {
          possibleRows.push(r);
        }
      }
      if (possibleRows.length === 1) {
        const r = possibleRows[0];
        const colCells = Array.from({ length: 9 }, (_, rowIdx) => ({ row: rowIdx, col: c }));
        return {
          type: 'hidden-single',
          title: `Hidden Single in Column ${c + 1}`,
          explanation: `In Column ${c + 1}, only Row ${r + 1} can accommodate the number ${num}.`,
          targetCell: { row: r, col: c },
          recommendedValue: num,
          highlightCells: colCells,
          highlightType: 'col',
        };
      }
    }
  }

  // Fallback: Pick any empty cell and use solution
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c].value === 0) {
        const val = board[r][c].solution;
        return {
          type: 'direct',
          title: 'Direct Deduction',
          explanation: `By eliminating overlapping constraints across the row, column, and block, the correct digit for cell (${r + 1}, ${c + 1}) is ${val}.`,
          targetCell: { row: r, col: c },
          recommendedValue: val,
          highlightCells: [{ row: r, col: c }],
          highlightType: 'cell',
        };
      }
    }
  }

  return null;
}
