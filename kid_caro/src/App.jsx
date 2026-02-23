import { useState, useCallback, useEffect, useRef } from 'react'
import './App.css'

const BOARD_SIZE = 15;
const WIN_CONDITION = 5;

// ========== CHECK WIN ==========
function checkWin(board, r, c, player) {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let [dr, dc] of directions) {
    let count = 1;
    let winCells = [[r, c]];
    for (let i = 1; i < WIN_CONDITION; i++) {
      const nr = r + dr * i, nc = c + dc * i;
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
      if (board[nr][nc] === player) { count++; winCells.push([nr, nc]); } else break;
    }
    for (let i = 1; i < WIN_CONDITION; i++) {
      const nr = r - dr * i, nc = c - dc * i;
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
      if (board[nr][nc] === player) { count++; winCells.push([nr, nc]); } else break;
    }
    if (count >= WIN_CONDITION) return winCells;
  }
  return null;
}

// ========== SIMPLE AI ==========
// Evaluate a line of 5 cells for scoring
function scoreLine(cells, ai, human) {
  const aiCount = cells.filter(c => c === ai).length;
  const humanCount = cells.filter(c => c === human).length;
  if (aiCount > 0 && humanCount > 0) return 0; // blocked line
  if (aiCount === 4) return 100000;
  if (humanCount === 4) return 50000;  // must block
  if (aiCount === 3) return 5000;
  if (humanCount === 3) return 2500;
  if (aiCount === 2) return 500;
  if (humanCount === 2) return 250;
  if (aiCount === 1) return 50;
  if (humanCount === 1) return 25;
  return 0;
}

function evaluateBoard(board, ai, human) {
  let score = 0;
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      for (let [dr, dc] of dirs) {
        const cells = [];
        for (let i = 0; i < WIN_CONDITION; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
          cells.push(board[nr][nc]);
        }
        if (cells.length === WIN_CONDITION) {
          score += scoreLine(cells, ai, human);
        }
      }
    }
  }
  return score;
}

function getAIMove(board, aiPlayer, humanPlayer) {
  // Get candidate moves: cells adjacent to existing pieces
  const candidates = new Set();
  const range = 2;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c]) {
        for (let dr = -range; dr <= range; dr++) {
          for (let dc = -range; dc <= range; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && !board[nr][nc]) {
              candidates.add(nr * BOARD_SIZE + nc);
            }
          }
        }
      }
    }
  }

  // If board is empty or no candidates, play center
  if (candidates.size === 0) {
    const center = Math.floor(BOARD_SIZE / 2);
    return [center, center];
  }

  let bestScore = -Infinity;
  let bestMove = null;

  for (const pos of candidates) {
    const r = Math.floor(pos / BOARD_SIZE);
    const c = pos % BOARD_SIZE;

    // Check if AI wins immediately
    board[r][c] = aiPlayer;
    if (checkWin(board, r, c, aiPlayer)) {
      board[r][c] = null;
      return [r, c];
    }
    board[r][c] = null;

    // Check if human wins immediately (must block)
    board[r][c] = humanPlayer;
    if (checkWin(board, r, c, humanPlayer)) {
      board[r][c] = null;
      return [r, c];
    }
    board[r][c] = null;

    // Score this move
    board[r][c] = aiPlayer;
    const score = evaluateBoard(board, aiPlayer, humanPlayer);
    board[r][c] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = [r, c];
    }
  }

  return bestMove;
}

// ========== MAIN APP ==========
const MODE_SELECT = 'select';
const MODE_PVP = 'pvp';
const MODE_AI = 'ai';

function App() {
  const [gameMode, setGameMode] = useState(MODE_SELECT);
  const [board, setBoard] = useState(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);
  const boardRef = useRef(board);
  boardRef.current = board;

  const makeMove = useCallback((r, c, currentBoard) => {
    const newBoard = currentBoard.map(row => [...row]);
    const player = newBoard[r]?.[c] === null
      ? (isXNext ? 'X' : 'O')
      : null;
    if (!player) return null;

    newBoard[r][c] = player;
    const winLine = checkWin(newBoard, r, c, player);
    return { newBoard, player, winLine };
  }, [isXNext]);

  const handleClick = useCallback((r, c) => {
    if (winner || board[r][c]) return;
    if (gameMode === MODE_AI && !isXNext) return; // AI's turn
    if (aiThinking) return;

    const newBoard = board.map(row => [...row]);
    const currentPlayer = isXNext ? 'X' : 'O';
    newBoard[r][c] = currentPlayer;
    setBoard(newBoard);
    setLastMove([r, c]);

    const winLine = checkWin(newBoard, r, c, currentPlayer);
    if (winLine) {
      setWinner(currentPlayer);
      setWinningLine(winLine);
    } else {
      setIsXNext(!isXNext);
    }
  }, [board, isXNext, winner, gameMode, aiThinking]);

  // AI move effect
  useEffect(() => {
    if (gameMode !== MODE_AI || isXNext || winner) return;

    setAiThinking(true);
    const timer = setTimeout(() => {
      const currentBoard = boardRef.current;
      const move = getAIMove(
        currentBoard.map(row => [...row]), // clone for safety
        'O', 'X'
      );
      if (move) {
        const [r, c] = move;
        const newBoard = currentBoard.map(row => [...row]);
        newBoard[r][c] = 'O';
        setBoard(newBoard);
        setLastMove([r, c]);

        const winLine = checkWin(newBoard, r, c, 'O');
        if (winLine) {
          setWinner('O');
          setWinningLine(winLine);
        } else {
          setIsXNext(true);
        }
      }
      setAiThinking(false);
    }, 300); // Small delay so it feels natural

    return () => clearTimeout(timer);
  }, [gameMode, isXNext, winner]);

  const resetGame = () => {
    setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
    setIsXNext(true);
    setWinner(null);
    setWinningLine([]);
    setLastMove(null);
    setAiThinking(false);
  };

  const goToMenu = () => {
    resetGame();
    setGameMode(MODE_SELECT);
  };

  // ========== MODE SELECT SCREEN ==========
  if (gameMode === MODE_SELECT) {
    return (
      <div className="app-container">
        <h1>Neon Caro</h1>
        <p className="subtitle">Chọn chế độ chơi</p>
        <div className="mode-buttons">
          <button className="mode-card pvp" onClick={() => setGameMode(MODE_PVP)}>
            <span className="mode-icon">👥</span>
            <span className="mode-label">2 Người chơi</span>
            <span className="mode-desc">Chơi cùng bạn bè</span>
          </button>
          <button className="mode-card ai" onClick={() => setGameMode(MODE_AI)}>
            <span className="mode-icon">🤖</span>
            <span className="mode-label">Chơi với AI</span>
            <span className="mode-desc">Bạn là X, AI là O</span>
          </button>
        </div>
      </div>
    );
  }

  // ========== GAME SCREEN ==========
  return (
    <div className="app-container">
      <div className="top-bar">
        <button className="back-btn" onClick={goToMenu}>← Menu</button>
        <h1 className="game-title">Neon Caro</h1>
        <div className="mode-badge">{gameMode === MODE_AI ? '🤖 vs AI' : '👥 PvP'}</div>
      </div>

      <div className="status-bar">
        <div className={`player-turn ${isXNext && !winner ? 'active-x' : ''}`}>
          ✖ Player X {gameMode === MODE_AI ? '(Bạn)' : ''}
        </div>
        <div className={`player-turn ${!isXNext && !winner ? 'active-o' : ''}`}>
          ● Player O {gameMode === MODE_AI ? '(AI)' : ''}
        </div>
      </div>

      <div className="game-board">
        {board.map((row, r) => (
          row.map((cell, c) => {
             const isWinning = winningLine.some(([wr, wc]) => wr === r && wc === c);
             const isLast = lastMove && lastMove[0] === r && lastMove[1] === c;
             return (
              <div
                key={`${r}-${c}`}
                className={`cell ${cell ? cell.toLowerCase() : ''} ${isWinning ? 'winning' : ''} ${isLast ? 'last-move' : ''}`}
                onClick={() => handleClick(r, c)}
              >
                {cell}
              </div>
            )
          })
        ))}
      </div>

      {winner && (
        <div className="winner-overlay" onClick={e => e.stopPropagation()}>
          <div className="winner-content">
            <h2 className={winner === 'X' ? 'win-x' : 'win-o'}>
              {gameMode === MODE_AI
                ? (winner === 'X' ? '🎉 Bạn thắng!' : '🤖 AI thắng!')
                : `${winner} Wins!`}
            </h2>
            <div className="winner-buttons">
              <button className="neon-btn primary" onClick={resetGame}>🔄 Ván mới</button>
              <button className="neon-btn secondary" onClick={goToMenu}>📋 Menu</button>
            </div>
          </div>
        </div>
      )}

      {!winner && (
        <button className="reset-btn" onClick={resetGame}>New Game</button>
      )}
    </div>
  )
}

export default App
