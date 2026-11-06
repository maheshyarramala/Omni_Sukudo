import React from 'react';
import {
  Timer,
  Pause,
  Play,
  RotateCcw,
  Plus,
  Trophy,
  Calendar,
  Settings,
  ScanLine,
  Heart,
} from 'lucide-react';
import { Difficulty } from '../types/sudoku';

interface GameHeaderProps {
  difficulty: Difficulty;
  onChangeDifficulty: (d: Difficulty) => void;
  seconds: number;
  isPaused: boolean;
  onTogglePause: () => void;
  mistakes: number;
  maxMistakes: number;
  onNewGame: () => void;
  onRestartGame: () => void;
  onOpenStats: () => void;
  onOpenDaily: () => void;
  onOpenScanner: () => void;
  onOpenSettings: () => void;
  showTimer: boolean;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  difficulty,
  onChangeDifficulty,
  seconds,
  isPaused,
  onTogglePause,
  mistakes,
  maxMistakes,
  onNewGame,
  onRestartGame,
  onOpenStats,
  onOpenDaily,
  onOpenScanner,
  onOpenSettings,
  showTimer,
}) => {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert', 'evil'];

  return (
    <div className="w-full max-w-[390px] mx-auto space-y-2 select-none">
      {/* Top action row */}
      <div className="flex items-center justify-between px-1">
        {/* Difficulty badge dropdown */}
        <div className="flex items-center gap-1">
          <select
            value={difficulty}
            onChange={e => onChangeDifficulty(e.target.value as Difficulty)}
            className="bg-slate-900 border border-slate-700 text-cyan-400 font-bold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 cursor-pointer capitalize shadow-sm"
          >
            {difficulties.map(d => (
              <option key={d} value={d} className="bg-slate-900 text-slate-100">
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Menu Icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenDaily}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Daily Challenge"
            aria-label="Daily Challenge"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenScanner}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Custom Board / Scanner"
            aria-label="Custom Board"
          >
            <ScanLine className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenStats}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Statistics & Records"
            aria-label="Statistics"
          >
            <Trophy className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Settings & Themes"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onNewGame}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-600/30 transition-all active:scale-95 cursor-pointer ml-1"
            title="Start New Puzzle"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Stats bar: Timer & Mistakes */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs">
        {/* Timer */}
        {showTimer ? (
          <div className="flex items-center gap-1.5">
            <Timer className="w-4 h-4 text-cyan-400" />
            <span className="font-mono font-bold text-sm text-slate-200">
              {formatTime(seconds)}
            </span>
            <button
              onClick={onTogglePause}
              className="p-1 rounded-md text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
              title={isPaused ? 'Resume Game' : 'Pause Game'}
              aria-label={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          <div />
        )}

        {/* Mistakes counter */}
        <div className="flex items-center gap-1.5">
          <Heart className={`w-3.5 h-3.5 ${mistakes > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-500'}`} />
          <span className="text-[11px] text-slate-400">Mistakes:</span>
          <span
            className={`font-semibold ${
              maxMistakes > 0 && mistakes >= maxMistakes
                ? 'text-rose-400 font-bold'
                : mistakes > 0
                ? 'text-amber-400'
                : 'text-slate-300'
            }`}
          >
            {maxMistakes > 0 ? `${mistakes}/${maxMistakes}` : `${mistakes} (Casual)`}
          </span>

          <button
            onClick={onRestartGame}
            className="p-1 ml-1 rounded-md text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            title="Restart current puzzle"
            aria-label="Restart puzzle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
