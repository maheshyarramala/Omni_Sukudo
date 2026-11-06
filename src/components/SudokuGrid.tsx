import React, { useEffect } from 'react';
import { CellPosition, HintStep, SudokuBoard, ThemeId } from '../types/sudoku';

interface SudokuGridProps {
  board: SudokuBoard;
  selectedCell: CellPosition | null;
  onSelectCell: (pos: CellPosition) => void;
  activeHint: HintStep | null;
  theme: ThemeId;
  highlightDuplicates: boolean;
  highlightRelated: boolean;
  highlightSameDigit: boolean;
  onKeyInput?: (key: string) => void;
}

export const SudokuGrid: React.FC<SudokuGridProps> = ({
  board,
  selectedCell,
  onSelectCell,
  activeHint,
  theme,
  highlightDuplicates,
  highlightRelated,
  highlightSameDigit,
  onKeyInput,
}) => {
  // Listen for keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        if (!selectedCell) {
          onSelectCell({ row: 4, col: 4 });
          return;
        }
        let { row, col } = selectedCell;
        if (e.key === 'ArrowUp') row = Math.max(0, row - 1);
        if (e.key === 'ArrowDown') row = Math.min(8, row + 1);
        if (e.key === 'ArrowLeft') col = Math.max(0, col - 1);
        if (e.key === 'ArrowRight') col = Math.min(8, col + 1);
        onSelectCell({ row, col });
        return;
      }

      if (onKeyInput) {
        if (/^[1-9]$/.test(e.key) || ['Backspace', 'Delete', 'n', 'N', 'h', 'H', 'u', 'U'].includes(e.key)) {
          onKeyInput(e.key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, onSelectCell, onKeyInput]);

  const selectedValue =
    selectedCell && board[selectedCell.row]?.[selectedCell.col]?.value > 0
      ? board[selectedCell.row][selectedCell.col].value
      : null;

  return (
    <div className="w-full max-w-[390px] mx-auto aspect-square p-1.5 sm:p-2 bg-slate-900/90 rounded-2xl border-2 border-slate-700/80 shadow-xl select-none">
      <div className="w-full h-full grid grid-cols-9 grid-rows-9 gap-0 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
        {board.map((rowCells, r) =>
          rowCells.map((cell, c) => {
            const isSelected = selectedCell?.row === r && selectedCell?.col === c;

            // Peer check: same row, col, or 3x3 box
            const isPeer =
              selectedCell &&
              (selectedCell.row === r ||
                selectedCell.col === c ||
                (Math.floor(selectedCell.row / 3) === Math.floor(r / 3) &&
                  Math.floor(selectedCell.col / 3) === Math.floor(c / 3)));

            // Same digit match
            const isSameDigit =
              highlightSameDigit &&
              selectedValue !== null &&
              cell.value === selectedValue &&
              cell.value !== 0;

            // Hint highlight
            const isHintTarget = activeHint?.targetCell.row === r && activeHint.targetCell.col === c;
            const isHintHelper = activeHint?.highlightCells.some(h => h.row === r && h.col === c);

            // Borders for 3x3 blocks
            const borderRight = (c % 3 === 2 && c !== 8) ? 'border-r-2 border-slate-600' : 'border-r border-slate-800/60';
            const borderBottom = (r % 3 === 2 && r !== 8) ? 'border-b-2 border-slate-600' : 'border-b border-slate-800/60';

            // Background dynamic styling
            let cellBg = 'bg-transparent';
            if (isSelected) {
              cellBg = 'bg-cyan-500/35 ring-2 ring-cyan-400 ring-inset z-10';
            } else if (isHintTarget) {
              cellBg = 'bg-emerald-500/40 ring-2 ring-emerald-400 animate-pulse z-10';
            } else if (isHintHelper) {
              cellBg = 'bg-amber-500/25 ring-1 ring-amber-400/60';
            } else if (cell.isError && highlightDuplicates) {
              cellBg = 'bg-rose-500/35';
            } else if (isSameDigit) {
              cellBg = 'bg-cyan-900/45 text-cyan-200 font-bold';
            } else if (isPeer && highlightRelated) {
              cellBg = 'bg-slate-800/45';
            }

            // Cell color tag from color marker tool
            const customTagStyle = cell.colorTag ? { backgroundColor: `${cell.colorTag}33` } : {};

            return (
              <button
                key={`${r}-${c}`}
                onClick={() => onSelectCell({ row: r, col: c })}
                style={customTagStyle}
                aria-label={`Cell row ${r + 1}, column ${c + 1}, value ${cell.value || 'empty'}`}
                className={`relative flex items-center justify-center transition-colors cursor-pointer select-none text-base sm:text-xl font-semibold ${borderRight} ${borderBottom} ${cellBg}`}
              >
                {/* Digit display - EXTRA LARGE AND HIGH CONTRAST */}
                {cell.value !== 0 ? (
                  <span
                    className={`transition-transform duration-100 text-2xl sm:text-3xl font-black ${
                      cell.isError && highlightDuplicates
                        ? 'text-rose-400 font-black animate-bounce'
                        : cell.isGiven
                        ? 'text-white font-black drop-shadow-sm'
                        : 'text-cyan-400 font-black'
                    } ${isSelected ? 'scale-115' : ''}`}
                  >
                    {cell.value}
                  </span>
                ) : (
                  /* 3x3 Notes / Pencil Marks */
                  <div className="w-full h-full p-0.5 grid grid-cols-3 grid-rows-3 pointer-events-none">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                      <span
                        key={n}
                        className={`text-[9.5px] sm:text-[11.5px] leading-none flex items-center justify-center font-mono font-bold ${
                          cell.notes.includes(n) ? 'text-slate-300' : 'text-transparent'
                        } ${isSameDigit && cell.notes.includes(selectedValue!) ? 'text-cyan-300 font-extrabold scale-125' : ''}`}
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                )}

                {/* Color Tag Dot indicator if active */}
                {cell.colorTag && (
                  <span
                    className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: cell.colorTag }}
                  />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
