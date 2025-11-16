import React, { useState, useEffect } from "react";
import "./styles.css";

export default function App() {
  const emptyBoard = Array(9).fill("");

  const [board, setBoard] = useState(emptyBoard);
  const [human, setHuman] = useState("X");
  const [ai, setAi] = useState("O");

  // NEW: user can choose who starts
  const [firstPlayer, setFirstPlayer] = useState("human");

  // current player depends on who starts
  const [currentPlayer, setCurrentPlayer] = useState(human);

  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState("Your turn");

  // Re-run game when human selection OR first move selection changes
  useEffect(() => {
    resetGame();
  }, [human, firstPlayer]);

  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  function checkWinner(b) {
    for (let [a, bIdx, c] of winPatterns) {
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) return b[a];
    }
    if (b.every(cell => cell)) return "draw";
    return null;
  }

  function availableMoves(b) {
    return b.map((v, i) => (v ? null : i)).filter(v => v !== null);
  }

  function evaluate(b) {
    const winner = checkWinner(b);
    if (winner === ai) return 10;
    if (winner === human) return -10;
    return 0;
  }

  function minimax(newBoard, player, depth = 0) {
    const winner = checkWinner(newBoard);
    if (winner !== null) return { score: evaluate(newBoard) - depth };

    const moves = [];

    for (let idx of availableMoves(newBoard)) {
      const move = { index: idx };
      newBoard[idx] = player;

      move.score =
        player === ai
          ? minimax(newBoard, human, depth + 1).score
          : minimax(newBoard, ai, depth + 1).score;

      newBoard[idx] = "";
      moves.push(move);
    }

    return player === ai
      ? moves.reduce((best, m) => (m.score > best.score ? m : best))
      : moves.reduce((best, m) => (m.score < best.score ? m : best));
  }

  function aiMove() {
    const best = minimax([...board], ai);
    handleMove(best.index, ai);
  }

  function handleMove(idx, player) {
    if (gameOver || board[idx]) return;

    const updated = [...board];
    updated[idx] = player;
    setBoard(updated);

    const winner = checkWinner(updated);

    if (winner) {
      setGameOver(true);
      setStatus(winner === "draw" ? "It's a draw!" : `Winner: ${winner}`);
      return;
    }

    const next = player === "X" ? "O" : "X";
    setCurrentPlayer(next);
    setStatus(next === human ? "Your turn" : "AI is thinking...");
  }

  useEffect(() => {
    if (!gameOver && currentPlayer === ai) {
      setTimeout(aiMove, 350);
    }
  }, [currentPlayer, gameOver]);

  function resetGame() {
    const enemy = human === "X" ? "O" : "X";

    setAi(enemy);
    setBoard([...emptyBoard]);
    setGameOver(false);

    // Determine who starts
    if (firstPlayer === "human") {
      setCurrentPlayer(human);
      setStatus("Your turn");
    } else {
      setCurrentPlayer(enemy);
      setStatus("AI is thinking...");
      setTimeout(aiMove, 400);
    }
  }

  return (
    <div className="fullscreen">
      
      {/* GitHub Button */}
      <a
        href="https://github.com/premrawat9873"
        target="_blank"
        className="github-btn"
      >
        Visit My GitHub
      </a>

      <div className="game-card">
        <h1 className="title">Tic-Tac-Toe <span>Minimax AI</span></h1>
        <p className="subtitle">Play against an unbeatable algorithm.</p>

        <div className="controls">
          <label>You play as:</label>
          <select value={human} onChange={e => setHuman(e.target.value)}>
            <option value="X">X</option>
            <option value="O">O</option>
          </select>

          <label>First Move:</label>
          <select value={firstPlayer} onChange={e => setFirstPlayer(e.target.value)}>
            <option value="human">You</option>
            <option value="ai">AI</option>
          </select>

          <button onClick={resetGame} className="primary">Restart</button>
        </div>

        <div className="board">
          {board.map((cell, i) => (
            <div
              key={i}
              className={`cell ${
                gameOver || currentPlayer !== human || cell ? "disabled" : ""
              }`}
              onClick={() => handleMove(i, human)}
            >
              {cell}
            </div>
          ))}
        </div>

        <div className="status">{status}</div>
      </div>
    </div>
  );
}
