const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { WebSocketServer } = require('ws');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://gofood:gofood%40123@cluster0.mho60.mongodb.net/gofood', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const gameSchema = new mongoose.Schema({
  board: Array,
  players: Array,
  currentPlayer: String,
  gameOver: Boolean,
  winner: String,
});

const Game = mongoose.model('Game', gameSchema);


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

const handleMove = async (ws, data) => {
  const { gameId, player, move } = data;

  const game = await Game.findById(gameId);

  if (!game || game.gameOver) {
    ws.send(JSON.stringify({ type: 'error', message: 'Invalid game or game over' }));
    return;
  }

  const isValidMove = processMove(game, player, move);

  if (isValidMove) {
    await game.save();
    wss.clients.forEach((client) => {
      client.send(JSON.stringify({ type: 'update', game }));
    });
  } else {
    ws.send(JSON.stringify({ type: 'error', message: 'Invalid move' }));
  }
};

// Simple move processing logic (to be extended with your game rules)
const processMove = (game, player, move) => {
  // Implement your move logic here based on game rules
  // Example: Update board, check win condition, switch turns, etc.
  return true; // or false if the move is invalid
};

// Create a new game
app.post('/api/new-game', async (req, res) => {
  const newGame = new Game({
    board: Array(5).fill().map(() => Array(5).fill(null)), // 5x5 grid
    players: ['Player1', 'Player2'],
    currentPlayer: 'Player1',
    gameOver: false,
    winner: null,
  });

  await newGame.save();
  res.json(newGame);
});

// Get the current game state
app.get('/api/game/:id', async (req, res) => {
  const game = await Game.findById(req.params.id);
  if (game) {
    res.json(game);
  } else {
    res.status(404).send('Game not found');
  }
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Upgrade the HTTP server to handle WebSocket connections
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
