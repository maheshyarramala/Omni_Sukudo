import React from 'react';
import { Settings, X, Volume2, Smartphone, Eye, Sparkles, ShieldAlert, Check } from 'lucide-react';
import { GameSettings, ThemeId } from '../types/sudoku';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const themes: { id: ThemeId; name: string; previewBg: string; previewAccent: string }[] = [
    { id: 'oled', name: 'OLED Dark', previewBg: 'bg-slate-950', previewAccent: 'bg-cyan-400' },
    { id: 'indigo', name: 'Royal Indigo', previewBg: 'bg-indigo-950', previewAccent: 'bg-indigo-400' },
    { id: 'neon', name: 'Cyberpunk Neon', previewBg: 'bg-fuchsia-950', previewAccent: 'bg-fuchsia-400' },
    { id: 'matcha', name: 'Forest Matcha', previewBg: 'bg-emerald-950', previewAccent: 'bg-emerald-400' },
    { id: 'paper', name: 'Paper & Ink', previewBg: 'bg-stone-900', previewAccent: 'bg-amber-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Settings className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Game Preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme Picker */}
        <div className="my-4 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Theme Palette</span>
          <div className="grid grid-cols-2 gap-2">
            {themes.map(t => {
              const isSelected = settings.theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onUpdateSettings({ theme: t.id })}
                  className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan-400 bg-slate-950 ring-1 ring-cyan-400'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3.5 h-3.5 rounded-full ${t.previewAccent}`} />
                    <span className="text-xs font-semibold text-slate-200">{t.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Game Rules & Difficulty Mode */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Game Rules</span>

          {/* Mistake Limit Toggle */}
          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-200">Mistake Limit</p>
              <p className="text-[10px] text-slate-400">3 strikes vs unlimited casual</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ maxMistakes: settings.maxMistakes === 3 ? 0 : 3 })}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                settings.maxMistakes === 3
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {settings.maxMistakes === 3 ? '3 Strikes' : 'Unlimited'}
            </button>
          </div>

          {/* Input Mode */}
          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-200">Input Mode</p>
              <p className="text-[10px] text-slate-400">Cell-first or Fast-fill digit first</p>
            </div>
            <button
              onClick={() =>
                onUpdateSettings({
                  inputMode: settings.inputMode === 'cell-first' ? 'digit-first' : 'cell-first',
                })
              }
              className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 text-cyan-300 cursor-pointer"
            >
              {settings.inputMode === 'cell-first' ? 'Cell First' : 'Fast Fill'}
            </button>
          </div>
        </div>

        {/* Assists & Visual Aids */}
        <div className="space-y-3 pt-4 border-t border-slate-800 mt-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Assists & Visual Aids
          </span>

          {/* Auto-Remove Notes */}
          <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-slate-200">Auto-Clear Notes</p>
              <p className="text-[10px] text-slate-400">Erase pencil marks in peer cells on entry</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoRemoveNotes}
              onChange={e => onUpdateSettings({ autoRemoveNotes: e.target.checked })}
              className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
            />
          </label>

          {/* Highlight Duplicates */}
          <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-slate-200">Highlight Errors</p>
              <p className="text-[10px] text-slate-400">Show red conflict when placing incorrect digit</p>
            </div>
            <input
              type="checkbox"
              checked={settings.highlightDuplicates}
              onChange={e => onUpdateSettings({ highlightDuplicates: e.target.checked })}
              className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
            />
          </label>

          {/* Highlight Peers */}
          <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-slate-200">Highlight Row/Col/Box</p>
              <p className="text-[10px] text-slate-400">Beam highlight active cell's peers</p>
            </div>
            <input
              type="checkbox"
              checked={settings.highlightRelated}
              onChange={e => onUpdateSettings({ highlightRelated: e.target.checked })}
              className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
            />
          </label>

          {/* Highlight Same Digit */}
          <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-slate-200">Highlight Matching Digits</p>
              <p className="text-[10px] text-slate-400">Glow all occurrences of selected number</p>
            </div>
            <input
              type="checkbox"
              checked={settings.highlightSameDigit}
              onChange={e => onUpdateSettings({ highlightSameDigit: e.target.checked })}
              className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
            />
          </label>
        </div>

        {/* Audio & Haptics */}
        <div className="space-y-3 pt-4 border-t border-slate-800 mt-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sound & Haptics</span>

          <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
            <span className="text-xs font-semibold text-slate-200">Synthesized Sound FX</span>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={e => onUpdateSettings({ soundEnabled: e.target.checked })}
              className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
            <span className="text-xs font-semibold text-slate-200">Vibration Haptics</span>
            <input
              type="checkbox"
              checked={settings.hapticsEnabled}
              onChange={e => onUpdateSettings({ hapticsEnabled: e.target.checked })}
              className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
            />
          </label>
        </div>

        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
