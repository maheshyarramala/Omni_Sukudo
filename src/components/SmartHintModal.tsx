import React from 'react';
import { Lightbulb, CheckCircle2, X, Sparkles } from 'lucide-react';
import { HintStep } from '../types/sudoku';

interface SmartHintModalProps {
  hint: HintStep;
  onApply: () => void;
  onClose: () => void;
}

export const SmartHintModal: React.FC<SmartHintModalProps> = ({ hint, onApply, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-2xl shadow-amber-500/10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Lightbulb className="w-5 h-5 fill-amber-400/20" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Smart Logic Coach</span>
              <h3 className="text-sm font-bold text-slate-100">{hint.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Hint"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Cell Badge */}
        <div className="my-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400">Target Location</p>
            <p className="text-xs font-semibold text-slate-200">
              Row {hint.targetCell.row + 1}, Col {hint.targetCell.col + 1}
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-xl">
            <span className="text-[11px] text-amber-300 font-medium">Value:</span>
            <span className="text-base font-extrabold text-amber-400">{hint.recommendedValue}</span>
          </div>
        </div>

        {/* Explanation Text */}
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50">
          {hint.explanation}
        </p>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            I'll Try It
          </button>
          <button
            onClick={onApply}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
            <span>Apply Digit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
