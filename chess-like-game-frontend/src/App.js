import React, { useState } from 'react';
import Board from './Components/Board';
import initialBoard from './initialBoard';
import './App.css';

const App = () => {
  const [board, setBoard] = useState(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [turn, setTurn] = useState('A');
  const [history, setHistory] = useState([]);
  const [winner, setWinner] = useState(null);

  const handleSquareClick = (row, col) => {
    if (winner) return; 

    const piece = board[row][col];

    if (selectedPiece) {
      const [fromRow, fromCol] = selectedPiece;
      const selectedPieceObj = board[fromRow][fromCol];
      const targetSquare = board[row][col];

      const rowDistance = Math.abs(row - fromRow);
      const colDistance = Math.abs(col - fromCol);
      const isValidMove = selectedPieceObj.name.startsWith('P')
        ? (rowDistance === 1 && colDistance === 0) || (rowDistance === 0 && colDistance === 1)
        : selectedPieceObj.name.startsWith('H')
        ? (rowDistance <= 2 && colDistance === 0) || (rowDistance === 0 && colDistance <= 2)
        : false;

      const isAdjacentOpponentPawn = selectedPieceObj.name.startsWith('P') &&
        targetSquare &&
        targetSquare.name.startsWith('P') &&
        targetSquare.player !== selectedPieceObj.player &&
        rowDistance <= 1 &&
        colDistance <= 1;

      if (isValidMove || isAdjacentOpponentPawn) {
        const newBoard = board.map(row => row.slice());
        newBoard[row][col] = newBoard[fromRow][fromCol];
        newBoard[fromRow][fromCol] = null;
        setBoard(newBoard);

        const move = {
          player: turn,
          piece: newBoard[row][col],
          from: [fromRow, fromCol],
          to: [row, col],
          captured: targetSquare || null,
          moveType: determineMoveType(fromRow, fromCol, row, col),
        };
        setHistory([...history, move]);

        setSelectedPiece(null);
        setTurn(turn === 'A' ? 'B' : 'A');
        checkForWinner(newBoard);
      } else {
        console.log('Invalid move:', {
          piece: selectedPieceObj,
          from: [fromRow, fromCol],
          to: [row, col],
          targetSquare,
          isValidMove
        });
        setSelectedPiece(null);
      }
    } else if (piece && piece.player === turn) {
      setSelectedPiece([row, col]);
    }
  };

  const determineMoveType = (fromRow, fromCol, toRow, toCol) => {
    if (fromRow === toRow && toCol > fromCol) return 'Right Move';
    if (fromRow === toRow && toCol < fromCol) return 'Left Move';
    if (fromCol === toCol && toRow > fromRow) return 'Forward Move';
    if (fromCol === toCol && toRow < fromRow) return 'Back Move';
    return '';
  };

  const checkForWinner = (board) => {
    const hasPlayerA = board.flat().some(cell => cell && cell.player === 'A');
    const hasPlayerB = board.flat().some(cell => cell && cell.player === 'B');

    if (!hasPlayerA) {
      setWinner('B');
    } else if (!hasPlayerB) {
      setWinner('A');
    }
  };

  const resetGame = () => {
    setBoard(initialBoard);
    setSelectedPiece(null);
    setTurn('A');
    setHistory([]);
    setWinner(null);
  };

  return (
    <div className="App">
      <h1>Advanced Chess-like Game</h1>
      
      <div style={{ color: 'white', margin: '20px 0', paddingLeft: '20px' }}>
          <li>There are two types of pieces: Pawns (P) and Heroes (H).</li>
          <li>Pawns can move 1 step in any direction (up, down, left, or right).</li>
          <li>Heroes can move up to 2 steps in any direction (up, down, left, or right).</li>
          <li>Click on the pawn, then on the square you want to move it.</li>
          <li>You can capture an opponent's piece if it's within your movement range.</li>
      </div>
      
      {winner ? (
        <div>
          <h2 style={{ color: 'green' }}>Player {winner} wins!</h2>
          <button onClick={resetGame}>Reset Game</button>
        </div>
      ) : (
        <h2>{turn === 'A' ? "Player A's turn" : "Player B's turn"}</h2>
      )}
      
      <Board board={board} onSquareClick={handleSquareClick} />
      <MoveHistory history={history} />
    </div>
  );
};

const MoveHistory = ({ history }) => {
  return (
    <div className="move-history">
      <h2>Move History</h2>
      <ul>
        {history.map((move, index) => (
          <li key={index} style={{ color: move.captured ? 'red' : 'white' }}>
            {move.player}-{move.piece.name}: {move.moveType}
            {move.captured && ` (Captured ${move.captured.player}-${move.captured.name})`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;




