import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  Smartphone,
  ExternalLink,
  BookOpen,
  X,
  FolderGit2,
} from 'lucide-react';
import JSZip from 'jszip';
import { FLUTTER_PROJECT_FILES, FlutterFile } from '../flutter/flutterProjectFiles';

interface FlutterCompanionModalProps {
  onClose: () => void;
}

export const FlutterCompanionModal: React.FC<FlutterCompanionModalProps> = ({ onClose }) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [activeTab, setActiveTab] = useState<'download' | 'vscode' | 'code' | 'guide'>('download');

  const currentFile: FlutterFile = FLUTTER_PROJECT_FILES[selectedFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleFile = (file: FlutterFile) => {
    const blob = new Blob([file.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Add each file to its exact folder structure in zip
      FLUTTER_PROJECT_FILES.forEach(file => {
        zip.file(file.path, file.code);
      });

      // Generate zip
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sudoku_prime_flutter.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-3xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">Flutter & Android Studio Hub</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Ready to Export
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Run this Sudoku game natively on your laptop in Android Studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              title="Download entire Flutter project as .ZIP"
            >
              <Download className={`w-3.5 h-3.5 ${isZipping ? 'animate-bounce' : ''}`} />
              <span>{isZipping ? 'Creating ZIP...' : 'Download .ZIP'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 px-3 sm:px-5 bg-slate-950/30 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('download')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'download'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Download Guide (Step-by-Step)</span>
          </button>
          <button
            onClick={() => setActiveTab('vscode')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'vscode'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>Install on Mobile (VS Code)</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'code'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Dart Codebase ({FLUTTER_PROJECT_FILES.length} Files)</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Android Studio Guide</span>
          </button>
        </div>

        {/* Content Body */}
        {activeTab === 'download' ? (
          /* Step-by-Step Download and Project Setup Guide */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-sm text-slate-300">
            {/* Download CTA Card */}
            <div className="bg-gradient-to-r from-blue-950/60 via-cyan-950/50 to-slate-900 p-5 rounded-3xl border border-cyan-700/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-cyan-950/40">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Instant Project Download
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Get Complete Flutter Sudoku Game
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-md">
                  Downloads a ready-to-run ZIP archive containing <code className="text-cyan-300">pubspec.yaml</code>, all <code className="text-cyan-300">lib/*.dart</code> files, and full assets.
                </p>
              </div>

              <button
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Download className={`w-5 h-5 ${isZipping ? 'animate-bounce' : ''}`} />
                <span>{isZipping ? 'Preparing ZIP...' : 'Download .ZIP Package'}</span>
              </button>
            </div>

            {/* 4 Simple Steps */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                How to Setup in 4 Steps
              </span>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Download and Extract the ZIP</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Click the <strong>Download .ZIP Package</strong> button above. Once downloaded to your computer's <em>Downloads</em> folder, right-click the <code className="text-cyan-300">sudoku_prime_flutter.zip</code> file and click <strong>Extract All...</strong> (or unzip it).
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Open the Folder in Visual Studio Code (or Android Studio)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Open <strong>VS Code</strong> &rarr; click <strong>File &gt; Open Folder...</strong> &rarr; select the extracted project folder.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Generate Platform Files & Get Packages</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Open the terminal in VS Code (<kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px]">Ctrl + `</kbd>) and run these two quick commands:
                  </p>
                  <div className="mt-1.5 p-2 bg-slate-900 rounded-xl font-mono text-xs text-cyan-300 space-y-1">
                    <div><code>flutter create .</code></div>
                    <div><code>flutter pub get</code></div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    <code className="text-cyan-300">flutter create .</code> builds the native Android project files for your device without touching your code.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Connect Mobile Phone & Run!</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Plug your phone in via USB with USB debugging enabled, then press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px]">F5</kbd> in VS Code (or run <code className="text-emerald-400">flutter run</code>). The game will compile and launch on your phone!
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'code' ? (
          <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
            {/* File List Sidebar */}
            <div className="w-full sm:w-56 bg-slate-950/70 border-b sm:border-b-0 sm:border-r border-slate-800 overflow-y-auto p-2 shrink-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1 block">Project Files</span>
              {FLUTTER_PROJECT_FILES.map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => {
                    setSelectedFileIndex(idx);
                    setCopied(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-between cursor-pointer mb-1 ${
                    selectedFileIndex === idx
                      ? 'bg-blue-600/20 text-cyan-300 font-bold border border-blue-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span className="truncate">{file.filename}</span>
                  <span className="text-[10px] text-slate-500 font-sans ml-1">
                    {file.filename.endsWith('.dart') ? 'Dart' : file.filename.endsWith('.yaml') ? 'YAML' : 'Doc'}
                  </span>
                </button>
              ))}
            </div>

            {/* Code Viewer Panel */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
              {/* File Info Bar */}
              <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between shrink-0">
                <div>
                  <span className="text-xs font-mono font-semibold text-cyan-300">{currentFile.path}</span>
                  <p className="text-[10px] text-slate-400 truncate max-w-md">{currentFile.description}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDownloadSingleFile(currentFile)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                    title={`Download ${currentFile.filename}`}
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code Pre Block */}
              <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed bg-slate-950 select-text">
                <pre>{currentFile.code}</pre>
              </div>
            </div>
          </div>
        ) : activeTab === 'vscode' ? (
          /* Step-by-Step VS Code & Mobile Install Tutorial */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-sm text-slate-300">
            <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-indigo-950/40 p-4 rounded-2xl border border-cyan-800/50">
              <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                Install on your Mobile Phone using Visual Studio Code
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Follow this quick 5-step checklist to run and install this Sudoku app directly onto your real smartphone using your laptop.
              </p>
            </div>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    STEP 1
                  </span>
                  <h4 className="text-sm font-bold text-white">Install the Flutter Extension in VS Code</h4>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Open VS Code on your laptop &rarr; click <strong>Extensions</strong> (<kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px]">Ctrl+Shift+X</kbd>) &rarr; search for <strong>Flutter</strong> (by Dart Code) &rarr; click <strong>Install</strong>.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    STEP 2
                  </span>
                  <h4 className="text-sm font-bold text-white">Enable Developer Options & USB Debugging on Your Mobile Phone</h4>
                </div>
                <div className="text-xs text-slate-400 mt-2 space-y-1.5">
                  <p>1. Open phone <strong>Settings</strong> &rarr; <strong>About Phone</strong>.</p>
                  <p>2. Find <strong>Build Number</strong> and <strong>tap it 7 times</strong> until you see <em>"You are now a developer!"</em>.</p>
                  <p>3. Go to <strong>Settings &rarr; System &rarr; Developer Options</strong> and switch <strong>ON</strong>:</p>
                  <ul className="list-disc list-inside pl-2 text-cyan-300 font-medium">
                    <li>USB Debugging</li>
                    <li>Install via USB (for Xiaomi, Redmi, Oppo, Vivo, Realme)</li>
                  </ul>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    STEP 3
                  </span>
                  <h4 className="text-sm font-bold text-white">Plug Phone into Laptop via USB Cable</h4>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Connect your phone with a USB cable. On your phone screen, when the prompt appears saying <strong>"Allow USB debugging?"</strong>, check <em>"Always allow from this computer"</em> and tap <strong>Allow</strong>.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    STEP 4
                  </span>
                  <h4 className="text-sm font-bold text-white">Select Your Mobile Phone in VS Code</h4>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Open your <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">sudoku_prime</code> project folder in VS Code. In the bottom-right status bar, click the device selector and pick your connected phone. Or run in terminal:
                </p>
                <div className="mt-2 p-2 bg-slate-900 rounded-xl font-mono text-xs text-cyan-300 flex items-center justify-between">
                  <code>flutter devices</code>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-800/60 bg-emerald-950/10">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    STEP 5
                  </span>
                  <h4 className="text-sm font-bold text-white">Install & Run!</h4>
                </div>
                <div className="text-xs text-slate-300 mt-2 space-y-3">
                  <div>
                    <p className="font-semibold text-cyan-300">Option 1: Live Run with Hot Reload</p>
                    <p className="text-slate-400">Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold">F5</kbd> in VS Code. It will build and immediately launch the game on your phone screen!</p>
                  </div>
                  <div>
                    <p className="font-semibold text-cyan-300">Option 2: Build Permanent APK (To keep or share)</p>
                    <div className="mt-1 p-2.5 bg-slate-900 rounded-xl font-mono text-xs text-slate-200 border border-slate-800">
                      <code>flutter build apk --release</code>
                    </div>
                    <p className="text-slate-400 mt-1 text-[11px]">
                      Your APK is saved at: <code className="text-amber-300">build/app/outputs/flutter-apk/app-release.apk</code>. You can install it with <code className="text-cyan-300">flutter install</code> or send it to your phone via WhatsApp/Drive!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Step-by-Step Android Studio Tutorial */
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300">
            <div className="bg-gradient-to-r from-blue-950/40 to-cyan-950/40 p-4 rounded-2xl border border-blue-800/50">
              <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                Running on your Laptop with Flutter & Android Studio
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                You can build and deploy this app directly to an Android phone, tablet, or emulator with high-fidelity 60 FPS performance and native haptics.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Step 1</span>
                <h4 className="text-sm font-bold text-white mt-1">Create New Project in Android Studio</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Launch Android Studio &rarr; select <strong>New Flutter Project</strong> &rarr; confirm your Flutter SDK path &rarr; name the app <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">sudoku_prime</code>.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Step 2</span>
                <h4 className="text-sm font-bold text-white mt-1">Add Dependencies</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Replace your <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">pubspec.yaml</code> with the one provided in the <strong>Dart Codebase</strong> tab, or run in the Android Studio terminal:
                </p>
                <div className="mt-2 p-2.5 bg-slate-900 rounded-xl font-mono text-xs text-slate-200 border border-slate-800 flex items-center justify-between">
                  <code>flutter pub add google_fonts provider shared_preferences confetti flutter_animate</code>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Step 3</span>
                <h4 className="text-sm font-bold text-white mt-1">Paste Dart Files into lib/</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Copy each file from the left sidebar into your project's <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">lib/</code> folder:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-400 mt-2 space-y-1">
                  <li><code>lib/models/sudoku_cell.dart</code></li>
                  <li><code>lib/logic/sudoku_solver.dart</code></li>
                  <li><code>lib/logic/hint_engine.dart</code></li>
                  <li><code>lib/providers/sudoku_provider.dart</code></li>
                  <li><code>lib/widgets/sudoku_board.dart</code></li>
                  <li><code>lib/main.dart</code></li>
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Step 4</span>
                <h4 className="text-sm font-bold text-white mt-1">Run on Android Device or Emulator</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Select your connected Android phone (via USB debugging) or Android Emulator from the device dropdown in Android Studio, then press <span className="text-emerald-400 font-bold">Shift + F10</span> (or click the green Play icon).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
