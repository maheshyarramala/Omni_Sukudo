import React from 'react';
import { Trophy, Flame, Timer, Zap, X, RotateCcw } from 'lucide-react';
import { Difficulty, GameStats } from '../types/sudoku';

interface StatsModalProps {
  stats: GameStats;
  onResetStats: () => void;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, onResetStats, onClose }) => {
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert', 'evil'];

  const formatTime = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Career Statistics</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top 4 Key Metrics */}
        <div className="grid grid-cols-2 gap-2 my-4">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Played</span>
            <p className="text-xl font-extrabold text-white mt-0.5">{stats.gamesPlayed}</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Win Rate</span>
            <p className="text-xl font-extrabold text-cyan-400 mt-0.5">{winRate}%</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold">
              <Flame className="w-3 h-3 text-orange-400" />
              <span>Current Streak</span>
            </div>
            <p className="text-xl font-extrabold text-orange-400 mt-0.5">{stats.currentStreak}</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Best Streak</span>
            </div>
            <p className="text-xl font-extrabold text-amber-400 mt-0.5">{stats.bestStreak}</p>
          </div>
        </div>

        {/* Best Times Record Table */}
        <div className="space-y-1.5 my-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
            Best Times by Difficulty
          </span>
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
            {difficulties.map(diff => (
              <div key={diff} className="flex items-center justify-between px-3 py-2 text-xs">
                <span className="capitalize font-medium text-slate-300">{diff}</span>
                <span className="font-mono font-bold text-cyan-400">
                  {formatTime(stats.bestTimeSeconds[diff])}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 mt-4">
          <button
            onClick={onResetStats}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Stats</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
