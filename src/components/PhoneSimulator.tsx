import React, { useState } from 'react';
import { Smartphone, Monitor, Code2, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../logic/audio';

interface PhoneSimulatorProps {
  children: React.ReactNode;
  onOpenFlutterStudio: () => void;
  onOpenSettings: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  children,
  onOpenFlutterStudio,
  onOpenSettings,
  soundEnabled,
  onToggleSound,
}) => {
  const [deviceFrame, setDeviceFrame] = useState<'mobile' | 'wide'>('mobile');
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-2 sm:p-4 select-none">
      {/* Top Global Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between py-2 px-3 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 mb-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              Sudoku Prime
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Mobile Pro & Flutter Studio</p>
          </div>
        </div>

        {/* Viewport switch and Flutter Hub launcher */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Flutter Studio Button */}
          <button
            onClick={onOpenFlutterStudio}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
            title="Open Flutter & Android Studio code export"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Flutter Studio</span>
            <span className="sm:hidden">Flutter</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            aria-label={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Device Frame Viewport Toggle */}
          <div className="bg-slate-950 p-0.5 rounded-xl border border-slate-800 flex items-center">
            <button
              onClick={() => setDeviceFrame('mobile')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                deviceFrame === 'mobile'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Mobile View (Pixel/iPhone frame)"
              aria-label="Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceFrame('wide')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                deviceFrame === 'wide'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Expanded Wide View"
              aria-label="Expanded View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full flex-1 flex items-center justify-center">
        {deviceFrame === 'mobile' ? (
          /* Phone Chassis (iPhone 16 Pro / Pixel 9 aesthetic on desktop; full bleed on mobile) */
          <div className="relative w-full max-w-[420px] sm:bg-slate-900 sm:rounded-[44px] p-0 sm:p-2.5 shadow-2xl sm:border-[4px] border-slate-800/90 sm:ring-1 sm:ring-white/10 overflow-hidden">
            {/* Screen bezel */}
            <div className="relative bg-slate-950 sm:rounded-[34px] rounded-2xl overflow-hidden flex flex-col border border-slate-800/60 min-h-[640px] sm:min-h-[680px]">
              {/* Dynamic Island / Notch + Phone Status Bar */}
              <div className="w-full pt-2 pb-1 px-4 sm:px-5 flex items-center justify-between text-[11px] font-semibold text-slate-400 shrink-0">
                <span>{currentTime}</span>
                {/* Camera punch hole / island */}
                <div className="h-4.5 w-24 bg-black rounded-full border border-slate-800/80 flex items-center justify-center gap-1 shadow-inner">
                  <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700/60" />
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-900/40" />
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 18.25A10.93 10.93 0 0 1 1 12C1 5.92 5.92 1 12 1s11 4.92 11 11c0 2.3-.7 4.43-1.9 6.2l-.62-.62C21.32 15.17 22 13.67 22 12c0-4.97-4.03-9-9-9zM12 7c-2.76 0-5 2.24-5 5 0 1.25.46 2.4 1.22 3.28l.71-.71C8.38 13.91 8 12.99 8 12c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .99-.38 1.91-.93 2.57l.71.71C16.54 14.4 17 13.25 17 12c0-2.76-2.24-5-5-5zM12 11c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
                  </svg>
                  <div className="w-4 h-2.5 border border-slate-400 rounded-sm p-0.5 flex items-center">
                    <div className="w-full h-full bg-slate-400 rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* In-Phone Screen Content */}
              <div className="flex-1 p-1.5 sm:p-2 flex flex-col justify-between">
                {children}
              </div>

              {/* Home Indicator Bar */}
              <div className="w-full flex justify-center py-1.5 shrink-0">
                <div className="w-28 sm:w-32 h-1 bg-slate-700/60 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          /* Wide Screen Mode */
          <div className="w-full max-w-4xl bg-slate-900/60 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-xl">
            {children}
          </div>
        )}
      </main>

      {/* Footer minimal info */}
      <footer className="w-full max-w-4xl flex items-center justify-between text-[11px] text-slate-500 py-2 px-3 mt-2">
        <span>Sudoku Prime • Designed for Mobile & Flutter Android Studio</span>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenFlutterStudio}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Flutter Source Files (.dart)
          </button>
          <span>•</span>
          <button
            onClick={onOpenSettings}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Settings
          </button>
        </div>
      </footer>
    </div>
  );
};
