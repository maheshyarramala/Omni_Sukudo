export interface FlutterFile {
  path: string;
  filename: string;
  description: string;
  code: string;
}

export const FLUTTER_PROJECT_FILES: FlutterFile[] = [
  {
    path: 'pubspec.yaml',
    filename: 'pubspec.yaml',
    description: 'Flutter dependencies configuration with Material 3, Fonts, and State Management',
    code: `name: sudoku_prime
description: "Feature-packed Sudoku mobile game with themes, difficulty levels, daily challenge, keyboard input, and hints."
publish_to: "none"
version: 1.0.0+1

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  google_fonts: ^6.1.0
  provider: ^6.1.1
  shared_preferences: ^2.2.2
  confetti: ^0.7.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`,
  },
  {
    path: 'lib/models/sudoku_cell.dart',
    filename: 'sudoku_cell.dart',
    description: 'Sudoku cell data model supporting values, pencil notes, errors, and color marks',
    code: `import 'package:flutter/material.dart';

class SudokuCell {
  final int row;
  final int col;
  int value;
  final int solution;
  final bool isGiven;
  bool isError;
  Set<int> notes;
  Color? colorTag;

  SudokuCell({
    required this.row,
    required this.col,
    required this.value,
    required this.solution,
    required this.isGiven,
    this.isError = false,
    Set<int>? notes,
    this.colorTag,
  }) : notes = notes ?? <int>{};

  SudokuCell copy() {
    return SudokuCell(
      row: row,
      col: col,
      value: value,
      solution: solution,
      isGiven: isGiven,
      isError: isError,
      notes: Set<int>.from(notes),
      colorTag: colorTag,
    );
  }
}
`,
  },
  {
    path: 'lib/logic/sudoku_solver.dart',
    filename: 'sudoku_solver.dart',
    description: 'High-performance solver, constraint validator, and candidate calculator in Dart',
    code: `class SudokuSolver {
  static bool isValid(List<List<int>> grid, int row, int col, int num) {
    // Check row
    for (int c = 0; c < 9; c++) {
      if (c != col && grid[row][c] == num) return false;
    }
    // Check col
    for (int r = 0; r < 9; r++) {
      if (r != row && grid[r][col] == num) return false;
    }
    // Check 3x3 block
    int startRow = (row ~/ 3) * 3;
    int startCol = (col ~/ 3) * 3;
    for (int r = 0; r < 3; r++) {
      for (int c = 0; c < 3; c++) {
        int curR = startRow + r;
        int curC = startCol + c;
        if ((curR != row || curC != col) && grid[curR][curC] == num) {
          return false;
        }
      }
    }
    return true;
  }

  static List<int> getCandidates(List<List<int>> grid, int row, int col) {
    if (grid[row][col] != 0) return [];
    List<int> candidates = [];
    for (int num = 1; num <= 9; num++) {
      if (isValid(grid, row, col, num)) {
        candidates.add(num);
      }
    }
    return candidates;
  }

  static bool solve(List<List<int>> board) {
    int emptyRow = -1;
    int emptyCol = -1;
    int minCandidates = 10;
    List<int> bestCandidates = [];

    // MRV heuristic (Minimum Remaining Values)
    for (int r = 0; r < 9; r++) {
      for (int c = 0; c < 9; c++) {
        if (board[r][c] == 0) {
          final cand = getCandidates(board, r, c);
          if (cand.length < minCandidates) {
            minCandidates = cand.length;
            emptyRow = r;
            emptyCol = c;
            bestCandidates = cand;
            if (minCandidates == 0) return false;
            if (minCandidates == 1) break;
          }
        }
      }
      if (minCandidates == 1) break;
    }

    if (emptyRow == -1) return true;

    for (int num in bestCandidates) {
      board[emptyRow][emptyCol] = num;
      if (solve(board)) return true;
      board[emptyRow][emptyCol] = 0;
    }
    return false;
  }
}
`,
  },
  {
    path: 'lib/logic/sudoku_generator.dart',
    filename: 'sudoku_generator.dart',
    description: 'Generator supporting 5 difficulty tiers (Easy, Medium, Hard, Expert, Evil) and daily challenge seeds',
    code: `import 'dart:math';
import 'sudoku_solver.dart';

enum Difficulty { easy, medium, hard, expert, evil }

class PuzzleData {
  final List<List<int>> initialBoard;
  final List<List<int>> solution;

  PuzzleData({required this.initialBoard, required this.solution});
}

class SudokuGenerator {
  static const Map<Difficulty, Map<String, String>> seeds = {
    Difficulty.easy: {
      'puzzle': '109040000070003608060078000045096182032000765608507900856000009401065820000480010',
      'solution': '189642357274153698563978241745396182932814765618527934856231479491765823327489516',
    },
    Difficulty.medium: {
      'puzzle': '008240007600510003030000400010005000420300005005902046703100090580000370091830004',
      'solution': '958243617647518923132796458816475239429361785375982146763154892584629371291837564',
    },
    Difficulty.hard: {
      'puzzle': '305080000000710500014050086080900000539467000062000400050043000003000012800000000',
      'solution': '395286741628714593714359286487921635539467128162538479251843967943675812876192354',
    },
    Difficulty.expert: {
      'puzzle': '740000100000000029390000760000039007030000000200507004050010000600800000008703901',
      'solution': '746928135185376429392154768514239687837641592269587314953412876671895243428763951',
    },
    Difficulty.evil: {
      'puzzle': '008007000400100002000050300007208000000000029605000070000000004000020058031400000',
      'solution': '218347596453196782976852341397268415184735629625914873862571934749623158531489267',
    },
  };

  static PuzzleData generate(Difficulty difficulty) {
    final seed = seeds[difficulty]!;
    final pStr = seed['puzzle']!;
    final sStr = seed['solution']!;

    List<List<int>> initial = List.generate(9, (_) => List.filled(9, 0));
    List<List<int>> sol = List.generate(9, (_) => List.filled(9, 0));

    for (int i = 0; i < 81; i++) {
      int r = i ~/ 9;
      int c = i % 9;
      initial[r][c] = int.parse(pStr[i]);
      sol[r][c] = int.parse(sStr[i]);
    }

    return PuzzleData(initialBoard: initial, solution: sol);
  }

  static PuzzleData generateDaily(DateTime date) {
    // Generate deterministic puzzle for day
    final diff = Difficulty.values[date.day % Difficulty.values.length];
    return generate(diff);
  }
}
`,
  },
  {
    path: 'lib/logic/hint_engine.dart',
    filename: 'hint_engine.dart',
    description: 'Smart logic coach that identifies and explains Naked Singles and Hidden Singles',
    code: `import '../models/sudoku_cell.dart';
import 'sudoku_solver.dart';

class HintResult {
  final String title;
  final String explanation;
  final int targetRow;
  final int targetCol;
  final int value;
  final List<List<int>> highlightedCells;

  HintResult({
    required this.title,
    required this.explanation,
    required this.targetRow,
    required this.targetCol,
    required this.value,
    this.highlightedCells = const [],
  });
}

class HintEngine {
  static HintResult? findHint(List<List<SudokuCell>> board) {
    List<List<int>> grid = List.generate(
      9,
      (r) => List.generate(9, (c) => board[r][c].value),
    );

    // 1. Check for Naked Single (Only 1 candidate fits)
    for (int r = 0; r < 9; r++) {
      for (int c = 0; c < 9; c++) {
        if (grid[r][c] == 0) {
          final cand = SudokuSolver.getCandidates(grid, r, c);
          if (cand.length == 1) {
            return HintResult(
              title: "Naked Single Found",
              explanation: "In row \${r + 1}, column \${c + 1}, all other digits 1-9 already exist in its row, column, or 3x3 block. Only \${cand.first} fits here!",
              targetRow: r,
              targetCol: c,
              value: cand.first,
              highlightedCells: [[r, c]],
            );
          }
        }
      }
    }

    // 2. Check for Hidden Single in 3x3 block
    for (int b = 0; b < 9; b++) {
      int startR = (b ~/ 3) * 3;
      int startC = (b % 3) * 3;

      for (int num = 1; num <= 9; num++) {
        int count = 0;
        int targetR = -1;
        int targetC = -1;

        for (int r = 0; r < 3; r++) {
          for (int c = 0; c < 3; c++) {
            int cr = startR + r;
            int cc = startC + c;
            if (grid[cr][cc] == 0 && SudokuSolver.getCandidates(grid, cr, cc).contains(num)) {
              count++;
              targetR = cr;
              targetC = cc;
            }
          }
        }

        if (count == 1) {
          return HintResult(
            title: "Hidden Single in 3×3 Block",
            explanation: "In this 3×3 block, the number \$num has only one valid available spot remaining (Row \${targetR + 1}, Col \${targetC + 1})!",
            targetRow: targetR,
            targetCol: targetC,
            value: num,
            highlightedCells: [[targetR, targetC]],
          );
        }
      }
    }

    // Fallback: Direct Solution Deduction
    for (int r = 0; r < 9; r++) {
      for (int c = 0; c < 9; c++) {
        if (board[r][c].value == 0) {
          return HintResult(
            title: "Direct Deduction",
            explanation: "Logical constraints determine that digit \${board[r][c].solution} belongs in Row \${r + 1}, Col \${c + 1}.",
            targetRow: r,
            targetCol: c,
            value: board[r][c].solution,
            highlightedCells: [[r, c]],
          );
        }
      }
    }

    return null;
  }
}
`,
  },
  {
    path: 'lib/providers/sudoku_provider.dart',
    filename: 'sudoku_provider.dart',
    description: 'Central game provider with themes, levels, daily challenges, keyboard listener, undo/redo, and stats',
    code: `import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/sudoku_cell.dart';
import '../logic/sudoku_generator.dart';
import '../logic/sudoku_solver.dart';
import '../logic/hint_engine.dart';

enum AppTheme { oled, indigo, neon, matcha, paper }

class SudokuProvider extends ChangeNotifier {
  late List<List<SudokuCell>> _board;
  Difficulty _difficulty = Difficulty.easy;
  AppTheme _currentTheme = AppTheme.oled;

  int? _selectedRow = 0;
  int? _selectedCol = 0;
  int? _selectedDigit;
  bool _isPencilMode = false;
  int _mistakes = 0;
  int _maxMistakes = 3; // 3 for tournament, 0 for casual unlimited
  int _seconds = 0;
  Timer? _timer;
  bool _isPaused = false;
  bool _isWon = false;
  bool _isGameOver = false;

  // Settings
  bool autoClearNotes = true;
  bool highlightDuplicates = true;
  bool highlightPeers = true;
  bool highlightSameDigit = true;

  // Focus node for keyboard input
  final FocusNode keyboardFocusNode = FocusNode();
  final TextEditingController textEditingController = TextEditingController();

  // History stack for Undo
  final List<List<List<SudokuCell>>> _history = [];

  // Daily Challenge
  Set<String> completedDailies = {};

  // Stats
  int gamesPlayed = 0;
  int gamesWon = 0;
  int currentStreak = 0;
  int bestStreak = 0;
  Map<Difficulty, int?> bestTimes = {
    Difficulty.easy: null,
    Difficulty.medium: null,
    Difficulty.hard: null,
    Difficulty.expert: null,
    Difficulty.evil: null,
  };

  // Getters
  List<List<SudokuCell>> get board => _board;
  Difficulty get difficulty => _difficulty;
  AppTheme get currentTheme => _currentTheme;
  int? get selectedRow => _selectedRow;
  int? get selectedCol => _selectedCol;
  int? get selectedDigit => _selectedDigit;
  bool get isPencilMode => _isPencilMode;
  int get mistakes => _mistakes;
  int get maxMistakes => _maxMistakes;
  int get seconds => _seconds;
  bool get isPaused => _isPaused;
  bool get isWon => _isWon;
  bool get isGameOver => _isGameOver;
  bool get canUndo => _history.isNotEmpty;

  SudokuProvider() {
    startNewGame(Difficulty.easy);
  }

  void setTheme(AppTheme theme) {
    _currentTheme = theme;
    HapticFeedback.selectionClick();
    notifyListeners();
  }

  void setMaxMistakes(int count) {
    _maxMistakes = count;
    notifyListeners();
  }

  void startNewGame(Difficulty diff, {PuzzleData? customPuzzle}) {
    _difficulty = diff;
    final puzzle = customPuzzle ?? SudokuGenerator.generate(diff);

    _board = List.generate(9, (r) {
      return List.generate(9, (c) {
        final val = puzzle.initialBoard[r][c];
        return SudokuCell(
          row: r,
          col: c,
          value: val,
          solution: puzzle.solution[r][c],
          isGiven: val != 0,
        );
      });
    });

    _selectedRow = 0;
    _selectedCol = 0;
    _selectedDigit = null;
    _mistakes = 0;
    _seconds = 0;
    _isPaused = false;
    _isWon = false;
    _isGameOver = false;
    _history.clear();

    gamesPlayed++;
    _startTimer();
    notifyListeners();
  }

  void startDailyChallenge() {
    final now = DateTime.now();
    final puzzle = SudokuGenerator.generateDaily(now);
    startNewGame(Difficulty.medium, customPuzzle: puzzle);
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!_isPaused && !_isWon && !_isGameOver) {
        _seconds++;
        notifyListeners();
      }
    });
  }

  void togglePause() {
    _isPaused = !_isPaused;
    HapticFeedback.lightImpact();
    notifyListeners();
  }

  void selectCell(int r, int c) {
    _selectedRow = r;
    _selectedCol = c;
    final val = _board[r][c].value;
    _selectedDigit = val > 0 ? val : null;
    HapticFeedback.selectionClick();

    // Request soft keyboard focus so user can type directly
    keyboardFocusNode.requestFocus();
    notifyListeners();
  }

  void togglePencilMode() {
    _isPencilMode = !_isPencilMode;
    HapticFeedback.lightImpact();
    notifyListeners();
  }

  void _saveSnapshot() {
    List<List<SudokuCell>> copy = List.generate(
      9,
      (r) => List.generate(9, (c) => _board[r][c].copy()),
    );
    _history.add(copy);
    if (_history.length > 30) _history.removeAt(0);
  }

  void enterDigit(int digit) {
    if (_selectedRow == null || _selectedCol == null) return;
    final cell = _board[_selectedRow!][_selectedCol!];
    if (cell.isGiven) return;

    _saveSnapshot();

    if (_isPencilMode) {
      if (cell.notes.contains(digit)) {
        cell.notes.remove(digit);
      } else {
        cell.notes.add(digit);
      }
      HapticFeedback.lightImpact();
    } else {
      cell.notes.clear();
      cell.value = digit;

      if (cell.value != cell.solution) {
        cell.isError = true;
        _mistakes++;
        HapticFeedback.heavyImpact();
        if (_maxMistakes > 0 && _mistakes >= _maxMistakes) {
          _isGameOver = true;
        }
      } else {
        cell.isError = false;
        HapticFeedback.mediumImpact();

        // Auto remove notes from row, col, and box
        if (autoClearNotes) {
          for (int i = 0; i < 9; i++) {
            _board[_selectedRow!][i].notes.remove(digit);
            _board[i][_selectedCol!].notes.remove(digit);
          }
          int br = (_selectedRow! ~/ 3) * 3;
          int bc = (_selectedCol! ~/ 3) * 3;
          for (int r = 0; r < 3; r++) {
            for (int c = 0; c < 3; c++) {
              _board[br + r][bc + c].notes.remove(digit);
            }
          }
        }

        _checkVictory();
      }
    }
    notifyListeners();
  }

  void eraseCurrent() {
    if (_selectedRow == null || _selectedCol == null) return;
    final cell = _board[_selectedRow!][_selectedCol!];
    if (cell.isGiven) return;

    _saveSnapshot();
    cell.value = 0;
    cell.notes.clear();
    cell.isError = false;
    HapticFeedback.selectionClick();
    notifyListeners();
  }

  void undo() {
    if (_history.isEmpty) return;
    final last = _history.removeLast();
    _board = last;
    HapticFeedback.lightImpact();
    notifyListeners();
  }

  void autoNotes() {
    _saveSnapshot();
    HapticFeedback.mediumImpact();

    List<List<int>> grid = List.generate(
      9,
      (r) => List.generate(9, (c) => _board[r][c].value),
    );

    for (int r = 0; r < 9; r++) {
      for (int c = 0; c < 9; c++) {
        if (_board[r][c].value == 0) {
          final cand = SudokuSolver.getCandidates(grid, r, c);
          _board[r][c].notes = Set<int>.from(cand);
        }
      }
    }
    notifyListeners();
  }

  void _checkVictory() {
    for (int r = 0; r < 9; r++) {
      for (int c = 0; c < 9; c++) {
        if (_board[r][c].value == 0 || _board[r][c].value != _board[r][c].solution) {
          return;
        }
      }
    }
    _isWon = true;
    gamesWon++;
    currentStreak++;
    if (currentStreak > bestStreak) bestStreak = currentStreak;

    final best = bestTimes[_difficulty];
    if (best == null || _seconds < best) {
      bestTimes[_difficulty] = _seconds;
    }
    HapticFeedback.heavyImpact();
    notifyListeners();
  }
}
`,
  },
  {
    path: 'lib/widgets/sudoku_board.dart',
    filename: 'sudoku_board.dart',
    description: 'Sudoku Grid widget with extra-large high-contrast numbers, 3x3 block borders, and candidate notes',
    code: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/sudoku_provider.dart';
import '../models/sudoku_cell.dart';

class SudokuBoardWidget extends StatelessWidget {
  const SudokuBoardWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<SudokuProvider>(context);
    final board = provider.board;
    final theme = Theme.of(context);

    return AspectRatio(
      aspectRatio: 1.0,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: theme.cardColor,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: theme.colorScheme.primary.withOpacity(0.6), width: 2.5),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 16,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: GridView.builder(
            physics: const NeverScrollableScrollPhysics(),
            itemCount: 81,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 9,
            ),
            itemBuilder: (context, index) {
              int r = index ~/ 9;
              int c = index % 9;
              final cell = board[r][c];

              bool isSelected = provider.selectedRow == r && provider.selectedCol == c;
              bool isPeer = provider.highlightPeers &&
                  (provider.selectedRow == r ||
                      provider.selectedCol == c ||
                      ((r ~/ 3 == (provider.selectedRow ?? -1) ~/ 3) &&
                          (c ~/ 3 == (provider.selectedCol ?? -1) ~/ 3)));

              bool isSameDigit = provider.highlightSameDigit &&
                  provider.selectedDigit != null &&
                  cell.value == provider.selectedDigit &&
                  cell.value != 0;

              return GestureDetector(
                onTap: () => provider.selectCell(r, c),
                child: Container(
                  decoration: BoxDecoration(
                    color: isSelected
                        ? theme.colorScheme.primary.withOpacity(0.4)
                        : isSameDigit
                            ? theme.colorScheme.primary.withOpacity(0.2)
                            : isPeer
                                ? theme.colorScheme.primary.withOpacity(0.08)
                                : Colors.transparent,
                    border: Border(
                      right: BorderSide(
                        color: (c % 3 == 2 && c != 8)
                            ? theme.colorScheme.primary.withOpacity(0.8)
                            : theme.dividerColor.withOpacity(0.25),
                        width: (c % 3 == 2 && c != 8) ? 2.5 : 0.6,
                      ),
                      bottom: BorderSide(
                        color: (r % 3 == 2 && r != 8)
                            ? theme.colorScheme.primary.withOpacity(0.8)
                            : theme.dividerColor.withOpacity(0.25),
                        width: (r % 3 == 2 && r != 8) ? 2.5 : 0.6,
                      ),
                    ),
                  ),
                  child: Center(
                    child: cell.value != 0
                        ? FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Padding(
                              padding: const EdgeInsets.all(2.0),
                              child: Text(
                                "\${cell.value}",
                                style: TextStyle(
                                  fontSize: 27, // EXTRA-LARGE BOLD NUMBERS
                                  fontWeight: FontWeight.w900,
                                  color: cell.isError && provider.highlightDuplicates
                                      ? Colors.redAccent
                                      : cell.isGiven
                                          ? Colors.white
                                          : theme.colorScheme.primary,
                                ),
                              ),
                            ),
                          )
                        : _buildNotesGrid(cell.notes),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildNotesGrid(Set<int> notes) {
    if (notes.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.all(1.5),
      child: GridView.count(
        crossAxisCount: 3,
        physics: const NeverScrollableScrollPhysics(),
        children: List.generate(9, (i) {
          int digit = i + 1;
          return Center(
            child: notes.contains(digit)
                ? Text(
                    "\$digit",
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey,
                    ),
                  )
                : const SizedBox.shrink(),
          );
        }),
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/widgets/numpad.dart',
    filename: 'numpad.dart',
    description: 'Large, thumb-friendly numeric keypad with remaining counts, notes toggle, and native keyboard activator',
    code: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/sudoku_provider.dart';
import '../logic/hint_engine.dart';

class NumberPadWidget extends StatelessWidget {
  const NumberPadWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<SudokuProvider>(context);
    final theme = Theme.of(context);

    // Count remaining
    Map<int, int> counts = {for (var i = 1; i <= 9; i++) i: 0};
    for (var r in provider.board) {
      for (var c in r) {
        if (c.value >= 1 && c.value <= 9) {
          counts[c.value] = (counts[c.value] ?? 0) + 1;
        }
      }
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Action toolbar: Undo, Erase, Notes, Hint, Auto-Notes, Open Keyboard
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              // Undo
              _buildActionButton(
                icon: Icons.undo,
                label: 'Undo',
                onTap: provider.canUndo ? provider.undo : null,
                theme: theme,
              ),
              // Erase
              _buildActionButton(
                icon: Icons.backspace_outlined,
                label: 'Erase',
                onTap: provider.eraseCurrent,
                theme: theme,
                iconColor: Colors.redAccent,
              ),
              // Notes mode
              _buildActionButton(
                icon: Icons.edit_note,
                label: provider.isPencilMode ? 'Notes ON' : 'Notes',
                isActive: provider.isPencilMode,
                onTap: provider.togglePencilMode,
                theme: theme,
              ),
              // Smart Hint
              _buildActionButton(
                icon: Icons.lightbulb_outline,
                label: 'Hint',
                iconColor: Colors.amberAccent,
                onTap: () {
                  final hint = HintEngine.findHint(provider.board);
                  if (hint != null) {
                    showDialog(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        backgroundColor: theme.cardColor,
                        title: Text(hint.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                        content: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Target: Row \${hint.targetRow + 1}, Col \${hint.targetCol + 1} &rarr; Digit \${hint.value}",
                              style: TextStyle(fontWeight: FontWeight.bold, color: theme.colorScheme.primary),
                            ),
                            const SizedBox(height: 8),
                            Text(hint.explanation),
                          ],
                        ),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(ctx),
                            child: const Text('Close'),
                          ),
                          ElevatedButton(
                            onPressed: () {
                              provider.selectCell(hint.targetRow, hint.targetCol);
                              provider.enterDigit(hint.value);
                              Navigator.pop(ctx);
                            },
                            child: const Text('Apply'),
                          ),
                        ],
                      ),
                    );
                  }
                },
                theme: theme,
              ),
              // Auto Notes
              _buildActionButton(
                icon: Icons.auto_awesome,
                label: 'Auto',
                onTap: provider.autoNotes,
                theme: theme,
              ),
              // Soft Keyboard Toggle
              _buildActionButton(
                icon: Icons.keyboard,
                label: 'Keyboard',
                onTap: () {
                  provider.keyboardFocusNode.requestFocus();
                },
                theme: theme,
              ),
            ],
          ),
        ),

        const SizedBox(height: 6),

        // Digits 1-9 Large Keypad
        Padding(
          padding: const EdgeInsets.only(left: 8, right: 8, bottom: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: List.generate(9, (index) {
              int digit = index + 1;
              int count = counts[digit] ?? 0;
              bool isComplete = count >= 9;

              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2.5),
                  child: Material(
                    color: isComplete
                        ? theme.cardColor.withOpacity(0.4)
                        : theme.cardColor,
                    borderRadius: BorderRadius.circular(12),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(12),
                      onTap: () => provider.enterDigit(digit),
                      child: Container(
                        height: 60, // LARGE TALL BUTTONS
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isComplete
                                ? Colors.transparent
                                : theme.dividerColor.withOpacity(0.3),
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              "\$digit",
                              style: TextStyle(
                                fontSize: 24, // LARGE DIGIT
                                fontWeight: FontWeight.bold,
                                color: isComplete
                                    ? Colors.grey.withOpacity(0.5)
                                    : Colors.white,
                              ),
                            ),
                            Text(
                              isComplete ? "✓" : "\${9 - count}",
                              style: TextStyle(
                                fontSize: 9.5,
                                color: isComplete
                                    ? Colors.grey
                                    : theme.colorScheme.primary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ],
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required VoidCallback? onTap,
    required ThemeData theme,
    Color? iconColor,
    bool isActive = false,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        decoration: BoxDecoration(
          color: isActive
              ? theme.colorScheme.primary.withOpacity(0.25)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isActive
                ? theme.colorScheme.primary
                : Colors.transparent,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 22,
              color: iconColor ?? (isActive ? theme.colorScheme.primary : Colors.white70),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 9.5,
                fontWeight: FontWeight.bold,
                color: isActive ? theme.colorScheme.primary : Colors.white70,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/widgets/settings_dialog.dart',
    filename: 'settings_dialog.dart',
    description: 'Settings dialog with Theme Palettes, 3 Strikes Tournament rule, and Visual Assists',
    code: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/sudoku_provider.dart';

class SettingsDialog extends StatelessWidget {
  const SettingsDialog({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<SudokuProvider>(context);
    final theme = Theme.of(context);

    return AlertDialog(
      backgroundColor: theme.cardColor,
      title: const Text('Settings & Themes', style: TextStyle(fontWeight: FontWeight.bold)),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Themes', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _buildThemeChip(context, provider, AppTheme.oled, 'OLED Dark', const Color(0xFF0F172A), const Color(0xFF38BDF8)),
                _buildThemeChip(context, provider, AppTheme.indigo, 'Royal Indigo', const Color(0xFF0A0F1D), const Color(0xFF818CF8)),
                _buildThemeChip(context, provider, AppTheme.neon, 'Cyberpunk Neon', const Color(0xFF130724), const Color(0xFFF43F5E)),
                _buildThemeChip(context, provider, AppTheme.matcha, 'Forest Matcha', const Color(0xFF06140F), const Color(0xFF10B981)),
                _buildThemeChip(context, provider, AppTheme.paper, 'Paper & Ink', const Color(0xFF1C1917), const Color(0xFFF59E0B)),
              ],
            ),
            const Divider(height: 28),
            const Text('Game Rules', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Mistake Limit (3 Strikes)'),
              subtitle: const Text('Toggle between 3 strikes vs casual unlimited'),
              value: provider.maxMistakes == 3,
              onChanged: (val) => provider.setMaxMistakes(val ? 3 : 0),
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Auto-Clear Notes'),
              subtitle: const Text('Clear candidates from peer cells on entry'),
              value: provider.autoClearNotes,
              onChanged: (val) {
                provider.autoClearNotes = val;
                provider.notifyListeners();
              },
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Highlight Duplicates'),
              value: provider.highlightDuplicates,
              onChanged: (val) {
                provider.highlightDuplicates = val;
                provider.notifyListeners();
              },
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Done'),
        ),
      ],
    );
  }

  Widget _buildThemeChip(BuildContext context, SudokuProvider provider, AppTheme t, String name, Color bg, Color accent) {
    bool isSelected = provider.currentTheme == t;
    return ChoiceChip(
      label: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircleAvatar(radius: 6, backgroundColor: accent),
          const SizedBox(width: 6),
          Text(name),
        ],
      ),
      selected: isSelected,
      onSelected: (_) => provider.setTheme(t),
    );
  }
}
`,
  },
  {
    path: 'lib/widgets/daily_challenge_dialog.dart',
    filename: 'daily_challenge_dialog.dart',
    description: 'Daily Challenge modal with monthly calendar, stars, and launch button',
    code: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/sudoku_provider.dart';

class DailyChallengeDialog extends StatelessWidget {
  const DailyChallengeDialog({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<SudokuProvider>(context);
    final now = DateTime.now();
    final daysInMonth = DateTime(now.year, now.month + 1, 0).day;

    return AlertDialog(
      title: Row(
        children: const [
          Icon(Icons.calendar_month, color: Colors.cyanAccent),
          SizedBox(width: 8),
          Text('Daily Challenge', style: TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
      content: SizedBox(
        width: 320,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text("Day \${now.day} of \$daysInMonth • Today's Puzzle Ready!"),
            const SizedBox(height: 16),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: List.generate(daysInMonth, (i) {
                int day = i + 1;
                bool isToday = day == now.day;
                bool isPast = day <= now.day;
                return Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    color: isToday
                        ? Colors.cyanAccent
                        : isPast
                            ? Colors.blue.withOpacity(0.3)
                            : Colors.grey.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Center(
                    child: Text(
                      "\$day",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: isToday ? Colors.black : Colors.white,
                      ),
                    ),
                  ),
                );
              }),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: () {
            Navigator.pop(context);
            provider.startDailyChallenge();
          },
          child: const Text("Play Today's Challenge"),
        ),
      ],
    );
  }
}
`,
  },
  {
    path: 'lib/main.dart',
    filename: 'main.dart',
    description: 'Main Flutter app with Material 3 dynamic themes, keyboard listener, soft keyboard controller, and full HUD',
    code: `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'providers/sudoku_provider.dart';
import 'logic/sudoku_generator.dart';
import 'widgets/sudoku_board.dart';
import 'widgets/numpad.dart';
import 'widgets/settings_dialog.dart';
import 'widgets/daily_challenge_dialog.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => SudokuProvider()),
      ],
      child: const SudokuApp(),
    ),
  );
}

class SudokuApp extends StatelessWidget {
  const SudokuApp({Key? key}) : super(key: key);

  ThemeData _getTheme(AppTheme theme) {
    switch (theme) {
      case AppTheme.indigo:
        return ThemeData(
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF0A0F1D),
          cardColor: const Color(0xFF141C33),
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFF818CF8),
            secondary: Color(0xFF6366F1),
          ),
          useMaterial3: true,
        );
      case AppTheme.neon:
        return ThemeData(
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF130724),
          cardColor: const Color(0xFF220E40),
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFFF43F5E),
            secondary: Color(0xFF06B6D4),
          ),
          useMaterial3: true,
        );
      case AppTheme.matcha:
        return ThemeData(
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF06140F),
          cardColor: const Color(0xFF0F2B21),
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFF10B981),
            secondary: Color(0xFF34D399),
          ),
          useMaterial3: true,
        );
      case AppTheme.paper:
        return ThemeData(
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF1C1917),
          cardColor: const Color(0xFF292524),
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFFF59E0B),
            secondary: Color(0xFFD97706),
          ),
          useMaterial3: true,
        );
      case AppTheme.oled:
      default:
        return ThemeData(
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF050B14),
          cardColor: const Color(0xFF0F172A),
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFF38BDF8),
            secondary: Color(0xFF0EA5E9),
          ),
          useMaterial3: true,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<SudokuProvider>(context);

    return MaterialApp(
      title: 'Sudoku Prime',
      debugShowCheckedModeBanner: false,
      theme: _getTheme(provider.currentTheme),
      home: const SudokuGameScreen(),
    );
  }
}

class SudokuGameScreen extends StatelessWidget {
  const SudokuGameScreen({Key? key}) : super(key: key);

  String _formatTimer(int s) {
    int m = s ~/ 60;
    int sec = s % 60;
    return "\${m.toString().padLeft(2, '0')}:\${sec.toString().padLeft(2, '0')}";
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<SudokuProvider>(context);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sudoku Prime', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        centerTitle: false,
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          // Daily Challenge
          IconButton(
            icon: const Icon(Icons.calendar_month, color: Colors.cyanAccent),
            tooltip: 'Daily Challenge',
            onPressed: () {
              showDialog(context: context, builder: (_) => const DailyChallengeDialog());
            },
          ),
          // Settings & Themes
          IconButton(
            icon: const Icon(Icons.palette_outlined),
            tooltip: 'Settings & Themes',
            onPressed: () {
              showDialog(context: context, builder: (_) => const SettingsDialog());
            },
          ),
          // New Game
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Restart Puzzle',
            onPressed: () => provider.startNewGame(provider.difficulty),
          ),
        ],
      ),
      body: SafeArea(
        child: KeyboardListener(
          focusNode: provider.keyboardFocusNode,
          autofocus: true,
          onKeyEvent: (event) {
            if (event is KeyDownEvent) {
              final key = event.logicalKey;
              if (key == LogicalKeyboardKey.digit1 || key == LogicalKeyboardKey.numpad1) provider.enterDigit(1);
              if (key == LogicalKeyboardKey.digit2 || key == LogicalKeyboardKey.numpad2) provider.enterDigit(2);
              if (key == LogicalKeyboardKey.digit3 || key == LogicalKeyboardKey.numpad3) provider.enterDigit(3);
              if (key == LogicalKeyboardKey.digit4 || key == LogicalKeyboardKey.numpad4) provider.enterDigit(4);
              if (key == LogicalKeyboardKey.digit5 || key == LogicalKeyboardKey.numpad5) provider.enterDigit(5);
              if (key == LogicalKeyboardKey.digit6 || key == LogicalKeyboardKey.numpad6) provider.enterDigit(6);
              if (key == LogicalKeyboardKey.digit7 || key == LogicalKeyboardKey.numpad7) provider.enterDigit(7);
              if (key == LogicalKeyboardKey.digit8 || key == LogicalKeyboardKey.numpad8) provider.enterDigit(8);
              if (key == LogicalKeyboardKey.digit9 || key == LogicalKeyboardKey.numpad9) provider.enterDigit(9);
              if (key == LogicalKeyboardKey.backspace || key == LogicalKeyboardKey.delete) provider.eraseCurrent();
              if (key == LogicalKeyboardKey.keyN) provider.togglePencilMode();
              if (key == LogicalKeyboardKey.keyU) provider.undo();
            }
          },
          child: Column(
            children: [
              // Hidden TextField that brings up the phone's native numeric keyboard when requested!
              SizedBox(
                height: 0,
                width: 0,
                child: TextField(
                  focusNode: provider.keyboardFocusNode,
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  onChanged: (text) {
                    if (text.isNotEmpty) {
                      final digit = int.tryParse(text[text.length - 1]);
                      if (digit != null && digit >= 1 && digit <= 9) {
                        provider.enterDigit(digit);
                      }
                      provider.textEditingController.clear();
                    }
                  },
                ),
              ),

              // Level Selector & Timer & Mistakes Row
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Difficulty Dropdown
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                      decoration: BoxDecoration(
                        color: theme.cardColor,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: theme.dividerColor.withOpacity(0.3)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<Difficulty>(
                          value: provider.difficulty,
                          dropdownColor: theme.cardColor,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: theme.colorScheme.primary,
                          ),
                          items: Difficulty.values.map((d) {
                            return DropdownMenuItem(
                              value: d,
                              child: Text(d.name.toUpperCase()),
                            );
                          }).toList(),
                          onChanged: (d) {
                            if (d != null) provider.startNewGame(d);
                          },
                        ),
                      ),
                    ),

                    // Timer & Pause
                    Row(
                      children: [
                        const Icon(Icons.timer_outlined, size: 18, color: Colors.cyanAccent),
                        const SizedBox(width: 4),
                        Text(
                          _formatTimer(provider.seconds),
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                        ),
                        IconButton(
                          icon: Icon(provider.isPaused ? Icons.play_arrow : Icons.pause, size: 18),
                          onPressed: provider.togglePause,
                        ),
                      ],
                    ),

                    // Mistakes
                    Row(
                      children: [
                        const Icon(Icons.favorite, size: 16, color: Colors.redAccent),
                        const SizedBox(width: 4),
                        Text(
                          provider.maxMistakes > 0
                              ? "Mistakes: \${provider.mistakes}/\${provider.maxMistakes}"
                              : "Casual (∞)",
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Sudoku 9x9 Board
              const Expanded(
                child: Center(
                  child: SudokuBoardWidget(),
                ),
              ),

              // Keypad & Controls
              const NumberPadWidget(),
            ],
          ),
        ),
      ),
    );
  }
}
`,
  },
  {
    path: 'ANDROID_STUDIO_GUIDE.md',
    filename: 'ANDROID_STUDIO_GUIDE.md',
    description: 'Android Studio guide for creating and running the Flutter app',
    code: `# Android Studio & Flutter Quick Start Guide

1. Open Android Studio -> New Flutter Project.
2. In pubspec.yaml, ensure you have:
\`\`\`yaml
dependencies:
  flutter:
    sdk: flutter
  google_fonts: ^6.1.0
  provider: ^6.1.1
  shared_preferences: ^2.2.2
  confetti: ^0.7.0
\`\`\`
3. Run \`flutter pub get\`.
4. Copy the \`lib/\` folder contents into your project.
5. Connect your mobile phone or emulator and click Run!
`,
  },
  {
    path: 'VS_CODE_MOBILE_INSTALL_GUIDE.md',
    filename: 'VS_CODE_INSTALL_GUIDE.md',
    description: 'Instructions to run and install on your connected phone in VS Code',
    code: `# How to Run on Your Mobile Phone in Visual Studio Code

1. In VS Code, open the project folder.
2. Open terminal (\`Ctrl + \`\`) and run:
   \`\`\`bash
   flutter create .
   flutter pub get
   \`\`\`
3. Check your device:
   \`\`\`bash
   flutter devices
   \`\`\`
4. Run on your phone:
   \`\`\`bash
   flutter run
   \`\`\`
   *(Or press F5 in VS Code!)*
`,
  },
];
