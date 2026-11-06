import React from 'react';
import {
  Pencil,
  Eraser,
  Lightbulb,
  Undo2,
  Redo2,
  Palette,
  Sparkles,
  Zap,
} from 'lucide-react';
import { InputMode, SudokuBoard } from '../types/sudoku';

interface NumberPadProps {
  board: SudokuBoard;
  onEnterDigit: (digit: number) => void;
  onErase: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isPencilMode: boolean;
  onTogglePencil: () => void;
  onAutoPencil: () => void;
  onRequestHint: () => void;
  inputMode: InputMode;
  onToggleInputMode: () => void;
  selectedDigit: number | null;
  onSelectDigit: (digit: number) => void;
  onColorMark: (color: string | undefined) => void;
  activeColor: string | undefined;
}

export const NumberPad: React.FC<NumberPadProps> = ({
  board,
  onEnterDigit,
  onErase,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isPencilMode,
  onTogglePencil,
  onAutoPencil,
  onRequestHint,
  inputMode,
  onToggleInputMode,
  selectedDigit,
  onSelectDigit,
  onColorMark,
  activeColor,
}) => {
  // Count how many times each digit 1-9 is currently placed
  const digitCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  if (board && board.length === 9) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const v = board[r]?.[c]?.value;
        if (v && v >= 1 && v <= 9) {
          digitCounts[v] = (digitCounts[v] || 0) + 1;
        }
      }
    }
  }

  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const colorOptions = [
    { name: 'Cyan', color: '#06b6d4' },
    { name: 'Indigo', color: '#6366f1' },
    { name: 'Amber', color: '#f59e0b' },
    { name: 'Emerald', color: '#10b981' },
    { name: 'Rose', color: '#f43f5e' },
  ];

  return (
    <div className="w-full max-w-[390px] mx-auto mt-2 space-y-2 select-none">
      {/* Utility Action Bar */}
      <div className="flex items-center justify-between px-1 gap-1">
        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 border text-xs transition-all cursor-pointer ${
            canUndo
              ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95'
              : 'bg-slate-950 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
          }`}
          title="Undo move (U)"
          aria-label="Undo"
        >
          <Undo2 className="w-4 h-4" />
          <span className="text-[10px]">Undo</span>
        </button>

        {/* Redo */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 border text-xs transition-all cursor-pointer ${
            canRedo
              ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95'
              : 'bg-slate-950 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
          }`}
          title="Redo move"
          aria-label="Redo"
        >
          <Redo2 className="w-4 h-4" />
          <span className="text-[10px]">Redo</span>
        </button>

        {/* Erase */}
        <button
          onClick={onErase}
          className="flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all text-xs cursor-pointer"
          title="Erase cell (Backspace/Del)"
          aria-label="Erase"
        >
          <Eraser className="w-4 h-4 text-rose-400" />
          <span className="text-[10px]">Erase</span>
        </button>

        {/* Notes / Pencil Toggle */}
        <button
          onClick={onTogglePencil}
          className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 border text-xs transition-all cursor-pointer ${
            isPencilMode
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Toggle Pencil Notes (N)"
          aria-label="Toggle Notes"
        >
          <Pencil className="w-4 h-4" />
          <span className="text-[10px] font-semibold">{isPencilMode ? 'ON' : 'Notes'}</span>
        </button>

        {/* Smart Hint */}
        <button
          onClick={onRequestHint}
          className="flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 bg-gradient-to-b from-amber-500/20 to-amber-600/10 border border-amber-500/50 text-amber-300 hover:from-amber-500/30 hover:to-amber-600/20 active:scale-95 transition-all text-xs cursor-pointer shadow-sm shadow-amber-500/10"
          title="Smart Logic Hint (H)"
          aria-label="Hint"
        >
          <Lightbulb className="w-4 h-4 text-amber-400 fill-amber-400/30" />
          <span className="text-[10px] font-bold">Hint</span>
        </button>
      </div>

      {/* Advanced Quick Tools: Auto-Candidates & Color Palette */}
      <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
        <button
          onClick={onAutoPencil}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:text-cyan-300 transition-colors cursor-pointer"
          title="Automatically calculate and fill all valid candidate notes"
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Auto-Notes</span>
        </button>

        <div className="flex items-center gap-1.5">
          {/* Fast-Fill / Input Mode Toggle */}
          <button
            onClick={onToggleInputMode}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
              inputMode === 'digit-first'
                ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300'
                : 'bg-slate-900 border-slate-800 hover:text-slate-200'
            }`}
            title="Switch between Cell First and Fast-Fill (Digit First)"
          >
            <Zap className={`w-3 h-3 ${inputMode === 'digit-first' ? 'text-indigo-400 fill-indigo-400' : ''}`} />
            <span>{inputMode === 'digit-first' ? 'Fast-Fill' : 'Cell-First'}</span>
          </button>

          {/* Color marker tool */}
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              activeColor ? 'border-cyan-400 bg-slate-800' : 'bg-slate-900 border-slate-800 hover:text-slate-200'
            }`}
            title="Highlight cell with color"
            aria-label="Color marker"
          >
            <Palette className="w-3 h-3 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Color picker dropdown strip */}
      {showColorPicker && (
        <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-900/90 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-medium">Mark:</span>
          {colorOptions.map(c => (
            <button
              key={c.name}
              onClick={() => {
                onColorMark(activeColor === c.color ? undefined : c.color);
              }}
              style={{ backgroundColor: c.color }}
              className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                activeColor === c.color ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
              }`}
              title={c.name}
              aria-label={`Mark ${c.name}`}
            />
          ))}
          <button
            onClick={() => onColorMark(undefined)}
            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Main 1-9 Number Row / Pad - EXTRA LARGE TALL BUTTONS */}
      <div className="grid grid-cols-9 gap-1 sm:gap-1.5 pt-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
          const count = digitCounts[num] || 0;
          const isComplete = count >= 9;
          const isSelected = selectedDigit === num;

          return (
            <button
              key={num}
              onClick={() => {
                if (inputMode === 'digit-first') {
                  onSelectDigit(num);
                }
                onEnterDigit(num);
              }}
              disabled={isComplete && inputMode !== 'digit-first'}
              aria-label={`Digit ${num}, ${9 - count} remaining`}
              className={`relative flex flex-col items-center justify-center py-2.5 sm:py-3.5 min-h-[58px] sm:min-h-[66px] rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-lg shadow-cyan-500/30 scale-105 z-10'
                  : isComplete
                  ? 'bg-slate-950/60 border-slate-800/60 text-slate-600 opacity-40 cursor-default'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-white font-extrabold hover:border-slate-500 active:scale-95'
              }`}
            >
              <span className="text-2xl sm:text-3xl font-black leading-none">{num}</span>
              <span
                className={`text-[9.5px] font-bold leading-none mt-1 ${
                  isSelected ? 'text-slate-900 font-black' : isComplete ? 'text-slate-700' : 'text-cyan-400'
                }`}
              >
                {isComplete ? '✓' : 9 - count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
