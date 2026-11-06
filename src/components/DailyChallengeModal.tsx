import React from 'react';
import { Calendar, Award, CheckCircle2, Play, X, Star } from 'lucide-react';

interface DailyChallengeModalProps {
  completedDates: string[]; // ['2026-11-01', ...]
  onPlayDaily: (dateStr: string) => void;
  onClose: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  completedDates,
  onPlayDaily,
  onClose,
}) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const isTodayCompleted = completedDates.includes(todayStr);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Daily Challenge</h3>
              <p className="text-[10px] text-slate-400">
                {monthNames[currentMonth]} {currentYear}
              </p>
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

        {/* Daily Trophies Progress */}
        <div className="my-3 p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-xs font-bold text-white">Monthly Crown</span>
              <p className="text-[10px] text-slate-400">
                {completedDates.length} of {daysInMonth} solved
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-amber-400">
            {Math.round((completedDates.length / daysInMonth) * 100)}%
          </span>
        </div>

        {/* Mini Calendar Grid */}
        <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 my-3">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-500 font-semibold mb-1">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Blank leading days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="h-7" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = dayNum === today.getDate();
              const isCompleted = completedDates.includes(dateStr);
              const isFuture = dayNum > today.getDate();

              return (
                <button
                  key={dayNum}
                  onClick={() => {
                    if (!isFuture) onPlayDaily(dateStr);
                  }}
                  disabled={isFuture}
                  className={`relative h-7 rounded-lg text-xs font-medium flex items-center justify-center transition-all cursor-pointer ${
                    isToday
                      ? 'bg-cyan-500 text-slate-950 font-bold ring-2 ring-cyan-300'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : isFuture
                      ? 'text-slate-700 opacity-40 cursor-not-allowed'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span>{dayNum}</span>
                  {isCompleted && (
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 absolute -top-1 -right-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Play Today Button */}
        <button
          onClick={() => onPlayDaily(todayStr)}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all active:scale-98 cursor-pointer mt-2"
        >
          {isTodayCompleted ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>Replay Today's Challenge</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Play Today's Challenge</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
