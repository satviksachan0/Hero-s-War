const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const Game = require('./game');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

let waitingPlayer = null; // Store the first player who connects
let currentGame = null;

wss.on('connection', (ws) => {
    console.log('New client connected');

    if (waitingPlayer === null) {
        // First player to join, wait for the second player
        waitingPlayer = ws;
        ws.send(JSON.stringify({ type: 'join', player: 1 }));
        ws.send(JSON.stringify({ type: 'message', text: 'Waiting for the second player to join...' }));
    } else {
        // Second player joins, start the game
        currentGame = new Game();
        ws.send(JSON.stringify({ type: 'join', player: 2 }));
        waitingPlayer.send(JSON.stringify({ type: 'message', text: 'Second player joined. The game is starting!' }));
        ws.send(JSON.stringify({ type: 'message', text: 'You have joined the game!' }));

        // Notify both players that the game has started
        const gameStartMessage = {
            type: 'start',
            board: currentGame.board,
            currentPlayer: 1
        };
        waitingPlayer.send(JSON.stringify(gameStartMessage));
        ws.send(JSON.stringify(gameStartMessage));

        // Set up message handling for both players
        handlePlayerMessages(waitingPlayer, ws, 1);
        handlePlayerMessages(ws, waitingPlayer, 2);

        // Reset waitingPlayer for the next game
        waitingPlayer = null;
    }

    ws.on('close', () => {
        console.log('Client disconnected');
        if (ws === waitingPlayer) {
            waitingPlayer = null;
        }
    });
});

function handlePlayerMessages(playerWs, opponentWs, playerNumber) {
    playerWs.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'move') {
            const result = currentGame.makeMove(playerNumber, data.from, data.to);
            if (result.valid) {
                const updateMessage = {
                    type: 'update',
                    board: currentGame.board,
                    currentPlayer: currentGame.currentPlayerIndex
                };
                playerWs.send(JSON.stringify(updateMessage));
                opponentWs.send(JSON.stringify(updateMessage));
                
                if (result.gameOver) {
                    const gameOverMessage = {
                        type: 'gameOver',
                        winner: `Player ${currentGame.currentPlayerIndex}`
                    };
                    playerWs.send(JSON.stringify(gameOverMessage));
                    opponentWs.send(JSON.stringify(gameOverMessage));
                }
            } else {
                playerWs.send(JSON.stringify({ type: 'invalid', reason: result.reason }));
            }
        }
    });
}
//---------------
const players = [];
let gameState = {
    board: [
        // Initial board setup, replace this with your actual game logic
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null]
    ],
    currentPlayer: 1
};

// Function to initialize the game with pieces
function initializeGame() {
    gameState.board = [
        [{ player: 1, piece: 'P1' }, { player: 1, piece: 'H1' }, { player: 1, piece: 'H2' }, { player: 1, piece: 'H1' }, { player: 1, piece: 'P1' }],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [{ player: 2, piece: 'P1' }, { player: 2, piece: 'H1' }, { player: 2, piece: 'H2' }, { player: 2, piece: 'H1' }, { player: 2, piece: 'P1' }]
    ];
}

// Call this function when both players have joined
initializeGame();

wss.on('connection', (ws) => {
    if (players.length < 2) {
        players.push(ws);
        ws.send(JSON.stringify({ type: 'join', player: players.length }));

        // Start the game if both players have joined
        if (players.length === 2) {
            players.forEach((player) => {
                player.send(JSON.stringify({ type: 'start', board: gameState.board, currentPlayer: gameState.currentPlayer }));
            });
        }
    }

    // Handle incoming messages from clients
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        // console.log('Received move:', data);
        // Handle moves and other game events here
        if (data.type === 'move') {
            const playerNumber = data.player;
            const result = currentGame.makeMove(playerNumber, data.from, data.to);
    
            // Handle the result...
        }
    });
});

//-------------

server.listen(8080, () => {
    console.log('Server started on port 8080');
});
