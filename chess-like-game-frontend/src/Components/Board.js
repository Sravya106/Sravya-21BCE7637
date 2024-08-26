import React from 'react';
import Square from './Square';
import './Board.css'

const Board = ({ board, onSquareClick }) => {
    console.log(board); // Add this line to see the board structure
    return (
      <div className="board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((square, colIndex) => (
              <div
                key={colIndex}
                className="board-square"
                onClick={() => onSquareClick(rowIndex, colIndex)}
              >
                {square && (
                  <div className={`piece player-${square.player}`}>
                    {`${square.player}-${square.name}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };
  

export default Board;
