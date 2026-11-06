import React, { useState } from 'react';
import { ScanLine, Play, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';
import { countSolutions, solveSudoku } from '../logic/sudokuSolver';
import { parsePuzzleString } from '../logic/sudokuGenerator';

interface CustomBoardModalProps {
  onLoadCustomPuzzle: (initialBoard: number[][], solution: number[][]) => void;
  onClose: () => void;
}

export const CustomBoardModal: React.FC<CustomBoardModalProps> = ({
  onLoadCustomPuzzle,
  onClose,
}) => {
  const [inputString, setInputString] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const samplePuzzles = [
    {
      name: "The Guardian Daily",
      str: "000000010400000000020000000000050407008000300001090000300400200050100000000806000",
    },
    {
      name: "Classic Master (Arto Inkala)",
      str: "800000000003600000070090200050007000000045700000100030001000068008500010090000400",
    },
    {
      name: "Gentle Morning Warmup",
      str: "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
    },
  ];

  const handleValidateAndPlay = () => {
    // Sanitize string
    const cleaned = inputString.replace(/[^0-9.]/g, '').replace(/\./g, '0');
    if (cleaned.length !== 81) {
      setStatusMessage({
        type: 'error',
        text: `Input must have exactly 81 characters (got ${cleaned.length}). Use 0 or . for empty cells.`,
      });
      return;
    }

    const { initialBoard } = parsePuzzleString(cleaned);
    const solutions = countSolutions(initialBoard, 2);

    if (solutions === 0) {
      setStatusMessage({
        type: 'error',
        text: 'This board contains contradictory rules and has no valid solutions.',
      });
      return;
    }

    const solved = solveSudoku(initialBoard);
    if (!solved.solved) {
      setStatusMessage({
        type: 'error',
        text: 'Unable to solve board with valid standard rules.',
      });
      return;
    }

    onLoadCustomPuzzle(initialBoard, solved.solution);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ScanLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Custom Board Scanner</h3>
              <p className="text-[10px] text-slate-400">Paste or load any 81-digit Sudoku</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Textarea */}
        <div className="my-3 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>81-Character String</span>
            <span className="font-mono">{inputString.replace(/[^0-9.]/g, '').length}/81</span>
          </div>
          <textarea
            value={inputString}
            onChange={e => {
              setInputString(e.target.value);
              setStatusMessage(null);
            }}
            placeholder="530070000600195000098000060800060003400803001700020006060000280000419005000080079"
            rows={4}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-400 resize-none"
          />
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-2.5 rounded-xl text-xs flex items-center gap-2 mb-3 ${
              statusMessage.type === 'error'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Quick Samples */}
        <div className="space-y-1 mb-4">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Sample Boards</span>
          <div className="flex flex-col gap-1">
            {samplePuzzles.map(sp => (
              <button
                key={sp.name}
                onClick={() => {
                  setInputString(sp.str);
                  setStatusMessage(null);
                }}
                className="text-left px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 flex items-center justify-between border border-slate-800/80 transition-colors cursor-pointer"
              >
                <span>{sp.name}</span>
                <span className="text-[10px] text-cyan-400 font-mono">Load</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleValidateAndPlay}
          className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Validate & Load Board</span>
        </button>
      </div>
    </div>
  );
};
