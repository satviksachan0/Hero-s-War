const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const Game = require('./game'); // Import your game class
require('dotenv').config();
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server:server });

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

let waitingPlayer = null; // Store the first player who connects
let currentGame = null; // Store the current game instance

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

    // Handle disconnection
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
            if (result.success) {
                if(result.gameOver){
                    const gameOverMessage = {
                        type: 'gameOver',
                        winner: result.currentPlayer === 0 ? 1 : 2
                    };
                    const lost = {
                        type: 'loser'
                    };
                    opponentWs.send(JSON.stringify(lost));
                    playerWs.send(JSON.stringify(gameOverMessage));

                }
                const updateMessage = {
                    type: 'update',
                    board: result.board,
                    currentPlayer: result.currentPlayer
                };
                playerWs.send(JSON.stringify(updateMessage));
                opponentWs.send(JSON.stringify(updateMessage));
                
                if (result.currentPlayer === playerNumber) { // Check if game is over
                    const gameOverMessage = {
                        type: 'gameOver',
                        winner: result.currentPlayer === 1 ? 2 : 1
                    };
                    playerWs.send(JSON.stringify(gameOverMessage));
                    opponentWs.send(JSON.stringify(gameOverMessage));
                }
            } else {
                playerWs.send(JSON.stringify({ type: 'invalid', reason: result.message }));
            }
        }
    });
}

server.listen(process.env.PORT || 8080, () => {
    console.log('Server started on port 8080');
});
