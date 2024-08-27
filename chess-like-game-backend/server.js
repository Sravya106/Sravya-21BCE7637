const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');

const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());

const games = new Map(); // In-memory game storage

const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'move') {
      handleMove(ws, data);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const handleMove = (ws, data) => {
  const { gameId, player, move } = data;
  const game = games.get(gameId);

  if (!game || game.gameOver) {
    ws.send(JSON.stringify({ type: 'error', message: 'Invalid game or game over' }));
    return;
  }

  const isValidMove = processMove(game, player, move);

  if (isValidMove) {
    games.set(gameId, game);
    wss.clients.forEach((client) => {
      client.send(JSON.stringify({ type: 'update', game }));
    });
  } else {
    ws.send(JSON.stringify({ type: 'error', message: 'Invalid move' }));
  }
};

const processMove = (game, player, move) => {
  // Logic to process the move will go here.
  // Right now, it just returns true as a placeholder.
  return true;
};

app.post('/api/new-game', (req, res) => {
  const gameId = Date.now().toString(); 
  const initialBoard = [
    [{ name: 'P1', player: 'A' }, { name: 'H1', player: 'A' }, { name: 'H2', player: 'A' }, { name: 'H3', player: 'A' }, { name: 'P2', player: 'A' }],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [{ name: 'P1', player: 'B' }, { name: 'H1', player: 'B' }, { name: 'H2', player: 'B' }, { name: 'H3', player: 'B' }, { name: 'P2', player: 'B' }],
  ];
  const newGame = {
    board: initialBoard,
    players: ['Player1', 'Player2'],
    currentPlayer: 'Player1',
    gameOver: false,
    winner: null,
  };

  games.set(gameId, newGame);
  res.json({ gameId, ...newGame });
});

app.get('/api/game/:id', (req, res) => {
  const game = games.get(req.params.id);
  if (game) {
    res.json(game);
  } else {
    res.status(404).send('Game not found');
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});



