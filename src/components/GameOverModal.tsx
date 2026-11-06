import React from 'react';
import { ShieldAlert, RotateCcw, Plus, LifeBuoy } from 'lucide-react';

interface GameOverModalProps {
  onRestart: () => void;
  onNewGame: () => void;
  onContinueCasual: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  onRestart,
  onNewGame,
  onContinueCasual,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-rose-500/50 rounded-3xl p-6 shadow-2xl shadow-rose-500/20 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 mx-auto rounded-3xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-3">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-extrabold text-white">Game Over</h3>
        <p className="text-xs text-slate-400 mt-1">
          You made 3 mistakes and triggered the tournament strike limit.
        </p>

        <div className="space-y-2 mt-5">
          <button
            onClick={onContinueCasual}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <LifeBuoy className="w-4 h-4 stroke-[2.5]" />
            <span>Continue with Unlimited Casual Mode</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart This Board</span>
          </button>

          <button
            onClick={onNewGame}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start Fresh Puzzle</span>
          </button>
        </div>
      </div>
    </div>
  );
};
