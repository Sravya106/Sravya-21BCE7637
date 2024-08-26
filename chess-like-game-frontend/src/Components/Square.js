import React from 'react';

const Square = ({ piece, onClick, row, col }) => {
  const isDark = (row + col) % 2 === 1;
  const backgroundColor = piece
    ? piece.player === 'A'
      ? 'red'
      : 'blue'
    : isDark
    ? 'darkgrey'
    : 'lightgrey';

  return (
    <div
      onClick={onClick}
      style={{
        width: '80px',
        height: '80px',
        border: '2px solid green',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '40px',
        backgroundColor,
      }}
    >
      {piece && <span>{piece.symbol}</span>}
    </div>
  );
};

export default Square;


