import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Timer, Heart, Sparkles, Plus, Code2, Share2 } from 'lucide-react';
import { Difficulty } from '../types/sudoku';
import { soundManager } from '../logic/audio';

interface WinModalProps {
  difficulty: Difficulty;
  seconds: number;
  mistakes: number;
  isNewBestTime: boolean;
  onNewGame: () => void;
  onOpenFlutter: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  difficulty,
  seconds,
  mistakes,
  isNewBestTime,
  onNewGame,
  onOpenFlutter,
}) => {
  useEffect(() => {
    soundManager.playVictory();
    // Confetti cannon
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#3b82f6', '#ec4899', '#f59e0b', '#10b981'],
      });
    } catch {
      // ignore
    }
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-cyan-500/50 rounded-3xl p-6 shadow-2xl shadow-cyan-500/20 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Crown / Trophy icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30 mb-4 animate-bounce">
          <Trophy className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-extrabold text-white">Puzzle Solved!</h2>
        <p className="text-xs text-slate-400 capitalize mt-0.5">{difficulty} Difficulty Completed</p>

        {isNewBestTime && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold my-3 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>New Best Time Record!</span>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-2 my-4">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium">
              <Timer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Time</span>
            </div>
            <p className="text-lg font-bold text-white font-mono mt-0.5">{formatTime(seconds)}</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Mistakes</span>
            </div>
            <p className="text-lg font-bold text-white mt-0.5">{mistakes}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onNewGame}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Play Next Puzzle</span>
          </button>

          <button
            onClick={onOpenFlutter}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <Code2 className="w-4 h-4" />
            <span>View Flutter / Android Studio Code</span>
          </button>
        </div>
      </div>
    </div>
  );
};
