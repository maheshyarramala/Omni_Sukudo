import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PhoneSimulator } from './components/PhoneSimulator';
import { SudokuGrid } from './components/SudokuGrid';
import { NumberPad } from './components/NumberPad';
import { GameHeader } from './components/GameHeader';
import { SmartHintModal } from './components/SmartHintModal';
import { StatsModal } from './components/StatsModal';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { CustomBoardModal } from './components/CustomBoardModal';
import { SettingsModal } from './components/SettingsModal';
import { WinModal } from './components/WinModal';
import { GameOverModal } from './components/GameOverModal';

import {
  CellPosition,
  Difficulty,
  GameSettings,
  GameStats,
  HintStep,
  InputMode,
  MoveHistory,
  SudokuBoard,
  SudokuCell,
} from './types/sudoku';
import { generateSudoku, parsePuzzleString, SEED_PUZZLES } from './logic/sudokuGenerator';
import { getCandidates, isBoardComplete, isValid } from './logic/sudokuSolver';
import { getSmartHint } from './logic/hintEngine';
import { soundManager } from './logic/audio';
import { triggerHaptic } from './logic/haptics';
import { FlutterCompanionModal } from './components/FlutterCompanionModal';
import { Play } from 'lucide-react';

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  autoRemoveNotes: true,
  highlightDuplicates: true,
  highlightRelated: true,
  highlightSameDigit: true,
  inputMode: 'cell-first',
  theme: 'oled',
  maxMistakes: 3,
  showTimer: true,
};

const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  bestTimeSeconds: {
    easy: null,
    medium: null,
    hard: null,
    expert: null,
    evil: null,
  },
  totalTimeSeconds: 0,
  currentStreak: 0,
  bestStreak: 0,
  hintsUsedCount: 0,
  perfectGamesCount: 0,
};

export default function App() {
  // Load settings and stats from localStorage
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('sudoku_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [stats, setStats] = useState<GameStats>(() => {
    try {
      const saved = localStorage.getItem('sudoku_stats');
      return saved ? { ...DEFAULT_STATS, ...JSON.parse(saved) } : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  const [completedDailies, setCompletedDailies] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sudoku_dailies');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Helper to create board synchronously
  const createInitialBoard = (diff: Difficulty): SudokuBoard => {
    const seed = SEED_PUZZLES[diff] || SEED_PUZZLES.easy;
    const parsed = parsePuzzleString(seed.puzzle, seed.solution);
    const newBoard: SudokuBoard = [];
    for (let r = 0; r < 9; r++) {
      newBoard[r] = [];
      for (let c = 0; c < 9; c++) {
        const val = parsed.initialBoard[r][c];
        newBoard[r][c] = {
          row: r,
          col: c,
          value: val,
          solution: parsed.solution[r][c],
          isGiven: val !== 0,
          isError: false,
          notes: [],
        };
      }
    }
    return newBoard;
  };

  // Game Core State
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [board, setBoard] = useState<SudokuBoard>(() => createInitialBoard('easy'));
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>({ row: 0, col: 0 });
  const [selectedDigit, setSelectedDigit] = useState<number | null>(null);
  const [isPencilMode, setIsPencilMode] = useState<boolean>(false);
  const [activeColor, setActiveColor] = useState<string | undefined>(undefined);
  const [mistakes, setMistakes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // Undo / Redo history
  const [history, setHistory] = useState<MoveHistory[]>([]);
  const [future, setFuture] = useState<MoveHistory[]>([]);

  // Modals state
  const [activeHint, setActiveHint] = useState<HintStep | null>(null);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [showDailyModal, setShowDailyModal] = useState<boolean>(false);
  const [showScannerModal, setShowScannerModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showFlutterModal, setShowFlutterModal] = useState<boolean>(false);

  // Sync audio enabled state with settings
  useEffect(() => {
    soundManager.enabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem('sudoku_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Persist stats
  useEffect(() => {
    try {
      localStorage.setItem('sudoku_stats', JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [stats]);

  // Persist completed dailies
  useEffect(() => {
    try {
      localStorage.setItem('sudoku_dailies', JSON.stringify(completedDailies));
    } catch {
      // ignore
    }
  }, [completedDailies]);

  // Deep clone board helper
  const cloneBoard = (b: SudokuBoard): SudokuBoard => {
    return b.map(row =>
      row.map(cell => ({
        ...cell,
        notes: [...cell.notes],
      }))
    );
  };

  // Start new game
  const startNewGame = useCallback((diff: Difficulty, customInitial?: number[][], customSol?: number[][]) => {
    let initialGrid: number[][];
    let solutionGrid: number[][];

    if (customInitial && customSol) {
      initialGrid = customInitial;
      solutionGrid = customSol;
    } else {
      const gen = generateSudoku(diff);
      initialGrid = gen.initialBoard;
      solutionGrid = gen.solution;
    }

    const newBoard: SudokuBoard = [];
    for (let r = 0; r < 9; r++) {
      newBoard[r] = [];
      for (let c = 0; c < 9; c++) {
        const val = initialGrid[r][c];
        newBoard[r][c] = {
          row: r,
          col: c,
          value: val,
          solution: solutionGrid[r][c],
          isGiven: val !== 0,
          isError: false,
          notes: [],
        };
      }
    }

    setBoard(newBoard);
    setDifficulty(diff);
    setSelectedCell({ row: 0, col: 0 });
    setSelectedDigit(null);
    setMistakes(0);
    setSeconds(0);
    setIsPaused(false);
    setIsWon(false);
    setIsGameOver(false);
    setIsNewRecord(false);
    setActiveHint(null);
    setHistory([]);
    setFuture([]);

    // Record game played
    setStats(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
    }));
  }, []);

  // Initialize board on first load
  useEffect(() => {
    startNewGame(difficulty);
  }, []);

  // Stopwatch timer
  useEffect(() => {
    if (isPaused || isWon || isGameOver || board.length === 0) return;
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, isWon, isGameOver, board.length]);

  // Check victory condition whenever board updates
  useEffect(() => {
    if (board.length === 0 || isWon || isGameOver) return;

    const simpleGrid = board.map(r => r.map(c => c.value));
    if (isBoardComplete(simpleGrid)) {
      setIsWon(true);
      if (settings.hapticsEnabled) triggerHaptic('success');

      // Update statistics
      setStats(prev => {
        const currentBest = prev.bestTimeSeconds[difficulty];
        const newRecord = currentBest === null || seconds < currentBest;
        setIsNewRecord(newRecord);

        const newStreak = prev.currentStreak + 1;
        return {
          ...prev,
          gamesWon: prev.gamesWon + 1,
          bestTimeSeconds: {
            ...prev.bestTimeSeconds,
            [difficulty]: newRecord ? seconds : currentBest,
          },
          totalTimeSeconds: prev.totalTimeSeconds + seconds,
          currentStreak: newStreak,
          bestStreak: Math.max(newStreak, prev.bestStreak),
          perfectGamesCount: mistakes === 0 ? prev.perfectGamesCount + 1 : prev.perfectGamesCount,
        };
      });
    }
  }, [board, isWon, isGameOver, difficulty, seconds, mistakes, settings.hapticsEnabled]);

  // Handle cell selection
  const handleSelectCell = (pos: CellPosition) => {
    setSelectedCell(pos);
    soundManager.playDigitTap(board[pos.row][pos.col].value || 5);
    if (settings.hapticsEnabled) triggerHaptic('light');

    // If in digit-first (fast-fill) mode and a digit is currently selected, immediately place it!
    if (settings.inputMode === 'digit-first' && selectedDigit !== null) {
      applyDigitToCell(pos.row, pos.col, selectedDigit);
    }
  };

  // Push to history before mutating
  const pushHistory = (currentBoard: SudokuBoard, currentMistakes: number, desc: string) => {
    setHistory(prev => [...prev.slice(-30), { board: cloneBoard(currentBoard), mistakes: currentMistakes, description: desc }]);
    setFuture([]);
  };

  // Apply digit to specific cell
  const applyDigitToCell = (r: number, c: number, digit: number) => {
    const cell = board[r][c];
    if (cell.isGiven) return;

    pushHistory(board, mistakes, `Set ${digit} at (${r+1}, ${c+1})`);

    const newBoard = cloneBoard(board);
    const targetCell = newBoard[r][c];

    if (isPencilMode) {
      // Toggle note
      soundManager.playPencilTap();
      if (settings.hapticsEnabled) triggerHaptic('light');

      if (targetCell.notes.includes(digit)) {
        targetCell.notes = targetCell.notes.filter(n => n !== digit);
      } else {
        targetCell.notes.push(digit);
        targetCell.notes.sort((a, b) => a - b);
      }
    } else {
      // Place actual digit
      targetCell.notes = [];
      targetCell.value = digit;

      const isCorrect = digit === targetCell.solution;
      if (!isCorrect) {
        targetCell.isError = true;
        soundManager.playError();
        if (settings.hapticsEnabled) triggerHaptic('error');

        const nextMistakes = mistakes + 1;
        setMistakes(nextMistakes);

        if (settings.maxMistakes > 0 && nextMistakes >= settings.maxMistakes) {
          setIsGameOver(true);
        }
      } else {
        targetCell.isError = false;
        soundManager.playDigitTap(digit);
        if (settings.hapticsEnabled) triggerHaptic('medium');

        // Auto-remove candidate notes from peers if enabled
        if (settings.autoRemoveNotes) {
          // Remove digit from row, col, box
          for (let i = 0; i < 9; i++) {
            newBoard[r][i].notes = newBoard[r][i].notes.filter(n => n !== digit);
            newBoard[i][c].notes = newBoard[i][c].notes.filter(n => n !== digit);
          }
          const boxR = Math.floor(r / 3) * 3;
          const boxC = Math.floor(c / 3) * 3;
          for (let br = 0; br < 3; br++) {
            for (let bc = 0; bc < 3; bc++) {
              newBoard[boxR + br][boxC + bc].notes = newBoard[boxR + br][boxC + bc].notes.filter(n => n !== digit);
            }
          }
        }
      }
    }

    setBoard(newBoard);
  };

  // Keypad enter digit
  const handleEnterDigit = (digit: number) => {
    if (selectedCell) {
      applyDigitToCell(selectedCell.row, selectedCell.col, digit);
    }
  };

  // Erase current cell
  const handleErase = () => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const cell = board[row][col];
    if (cell.isGiven) return;

    pushHistory(board, mistakes, `Erase (${row+1}, ${col+1})`);
    soundManager.playErase();
    if (settings.hapticsEnabled) triggerHaptic('light');

    const newBoard = cloneBoard(board);
    newBoard[row][col].value = 0;
    newBoard[row][col].notes = [];
    newBoard[row][col].isError = false;
    setBoard(newBoard);
  };

  // Undo move
  const handleUndo = () => {
    if (history.length === 0) return;
    const lastMove = history[history.length - 1];
    setFuture(prev => [...prev, { board: cloneBoard(board), mistakes, description: 'undo' }]);
    setBoard(lastMove.board);
    setMistakes(lastMove.mistakes);
    setHistory(prev => prev.slice(0, -1));
    soundManager.playDigitTap(4);
  };

  // Redo move
  const handleRedo = () => {
    if (future.length === 0) return;
    const nextMove = future[future.length - 1];
    setHistory(prev => [...prev, { board: cloneBoard(board), mistakes, description: 'redo' }]);
    setBoard(nextMove.board);
    setMistakes(nextMove.mistakes);
    setFuture(prev => prev.slice(0, -1));
    soundManager.playDigitTap(6);
  };

  // Auto-fill all candidate notes across entire board
  const handleAutoPencil = () => {
    pushHistory(board, mistakes, 'Auto Candidates');
    soundManager.playPencilTap();
    if (settings.hapticsEnabled) triggerHaptic('medium');

    const simpleGrid = board.map(r => r.map(c => c.value));
    const newBoard = cloneBoard(board);

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (newBoard[r][c].value === 0) {
          newBoard[r][c].notes = getCandidates(simpleGrid, r, c);
        }
      }
    }
    setBoard(newBoard);
  };

  // Color mark cell
  const handleColorMark = (color: string | undefined) => {
    setActiveColor(color);
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    pushHistory(board, mistakes, `Color Mark (${row+1}, ${col+1})`);

    const newBoard = cloneBoard(board);
    newBoard[row][col].colorTag = color;
    setBoard(newBoard);
  };

  // Request Smart Logic Hint
  const handleRequestHint = () => {
    soundManager.playHint();
    if (settings.hapticsEnabled) triggerHaptic('medium');

    const hint = getSmartHint(board);
    if (hint) {
      setActiveHint(hint);
      setSelectedCell(hint.targetCell);
      setStats(prev => ({ ...prev, hintsUsedCount: prev.hintsUsedCount + 1 }));
    }
  };

  // Apply Hint to board
  const handleApplyHint = () => {
    if (!activeHint) return;
    applyDigitToCell(activeHint.targetCell.row, activeHint.targetCell.col, activeHint.recommendedValue);
    setActiveHint(null);
  };

  // Keyboard shortcut handler
  const handleKeyInput = (key: string) => {
    if (/^[1-9]$/.test(key)) {
      handleEnterDigit(parseInt(key, 10));
    } else if (['Backspace', 'Delete'].includes(key)) {
      handleErase();
    } else if (key.toLowerCase() === 'n') {
      setIsPencilMode(prev => !prev);
    } else if (key.toLowerCase() === 'h') {
      handleRequestHint();
    } else if (key.toLowerCase() === 'u') {
      handleUndo();
    }
  };

  // Restart current puzzle
  const handleRestartCurrent = () => {
    pushHistory(board, mistakes, 'Restart');
    const newBoard = cloneBoard(board);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!newBoard[r][c].isGiven) {
          newBoard[r][c].value = 0;
          newBoard[r][c].notes = [];
          newBoard[r][c].isError = false;
        }
      }
    }
    setBoard(newBoard);
    setMistakes(0);
    setIsGameOver(false);
  };

  // Daily challenge launch
  const handlePlayDaily = (dateStr: string) => {
    setShowDailyModal(false);
    // Use deterministically seeded daily puzzle
    const seed = SEED_PUZZLES.medium;
    const parsed = parsePuzzleString(seed.puzzle, seed.solution);
    startNewGame('medium', parsed.initialBoard, parsed.solution);
  };

  // Custom puzzle load
  const handleLoadCustomPuzzle = (initialBoard: number[][], solution: number[][]) => {
    setShowScannerModal(false);
    startNewGame('hard', initialBoard, solution);
  };

  // Theme container classes
  const themeClasses: Record<string, string> = {
    oled: 'bg-slate-950 text-slate-100',
    indigo: 'bg-[#0a0f1d] text-indigo-50',
    neon: 'bg-[#0f071b] text-fuchsia-50',
    matcha: 'bg-[#06140f] text-emerald-50',
    paper: 'bg-[#181614] text-amber-50',
  };

  return (
    <div className={`w-full min-h-screen ${themeClasses[settings.theme] || themeClasses.oled}`}>
      <PhoneSimulator
        onOpenFlutterStudio={() => setShowFlutterModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
      >
        {/* Game Header */}
        <GameHeader
          difficulty={difficulty}
          onChangeDifficulty={d => startNewGame(d)}
          seconds={seconds}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(!isPaused)}
          mistakes={mistakes}
          maxMistakes={settings.maxMistakes}
          onNewGame={() => startNewGame(difficulty)}
          onRestartGame={handleRestartCurrent}
          onOpenStats={() => setShowStatsModal(true)}
          onOpenDaily={() => setShowDailyModal(true)}
          onOpenScanner={() => setShowScannerModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          showTimer={settings.showTimer}
        />

        {/* Board Surface or Paused Shield */}
        <div className="relative my-auto">
          <SudokuGrid
            board={board}
            selectedCell={selectedCell}
            onSelectCell={handleSelectCell}
            activeHint={activeHint}
            theme={settings.theme}
            highlightDuplicates={settings.highlightDuplicates}
            highlightRelated={settings.highlightRelated}
            highlightSameDigit={settings.highlightSameDigit}
            onKeyInput={handleKeyInput}
          />

          {/* Privacy Pause Shield */}
          {isPaused && (
            <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-slate-800">
              <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
                <Play className="w-7 h-7 fill-current ml-1" />
              </div>
              <h3 className="text-base font-bold text-white">Game Paused</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4">
                The board is shielded while timer is paused. Take your time!
              </p>
              <button
                onClick={() => setIsPaused(false)}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
              >
                Resume Game
              </button>
            </div>
          )}
        </div>

        {/* Number Pad & Controls */}
        <NumberPad
          board={board}
          onEnterDigit={handleEnterDigit}
          onErase={handleErase}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={history.length > 0}
          canRedo={future.length > 0}
          isPencilMode={isPencilMode}
          onTogglePencil={() => setIsPencilMode(!isPencilMode)}
          onAutoPencil={handleAutoPencil}
          onRequestHint={handleRequestHint}
          inputMode={settings.inputMode}
          onToggleInputMode={() =>
            setSettings(s => ({
              ...s,
              inputMode: s.inputMode === 'cell-first' ? 'digit-first' : 'cell-first',
            }))
          }
          selectedDigit={selectedDigit}
          onSelectDigit={d => setSelectedDigit(d)}
          onColorMark={handleColorMark}
          activeColor={activeColor}
        />
      </PhoneSimulator>

      {/* Modals */}
      {activeHint && (
        <SmartHintModal
          hint={activeHint}
          onApply={handleApplyHint}
          onClose={() => setActiveHint(null)}
        />
      )}

      {showStatsModal && (
        <StatsModal
          stats={stats}
          onResetStats={() => setStats(DEFAULT_STATS)}
          onClose={() => setShowStatsModal(false)}
        />
      )}

      {showDailyModal && (
        <DailyChallengeModal
          completedDates={completedDailies}
          onPlayDaily={handlePlayDaily}
          onClose={() => setShowDailyModal(false)}
        />
      )}

      {showScannerModal && (
        <CustomBoardModal
          onLoadCustomPuzzle={handleLoadCustomPuzzle}
          onClose={() => setShowScannerModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={newS => setSettings(s => ({ ...s, ...newS }))}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showFlutterModal && (
        <FlutterCompanionModal onClose={() => setShowFlutterModal(false)} />
      )}

      {isWon && (
        <WinModal
          difficulty={difficulty}
          seconds={seconds}
          mistakes={mistakes}
          isNewBestTime={isNewRecord}
          onNewGame={() => startNewGame(difficulty)}
          onOpenFlutter={() => {
            setIsWon(false);
            setShowFlutterModal(true);
          }}
        />
      )}

      {isGameOver && (
        <GameOverModal
          onRestart={handleRestartCurrent}
          onNewGame={() => startNewGame(difficulty)}
          onContinueCasual={() => {
            setSettings(s => ({ ...s, maxMistakes: 0 }));
            setIsGameOver(false);
          }}
        />
      )}
    </div>
  );
}
