const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const Game = require('./game'); 

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server: server });

//frontend dir
app.use(express.static(path.join(__dirname, 'public')));


const games = {}; 

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        const gameId = data.gameId;

        if (data.type === 'create') {
            if (!games[gameId]) {

                games[gameId] = {
                    game: new Game(),
                    //player store
                    players: [ws, null]  
                };
                ws.send(JSON.stringify({ type: 'join', player: 1 }));
                ws.send(JSON.stringify({ type: 'message', text: 'Game created. Waiting for the second player to join...' }));
            } else {
                ws.send(JSON.stringify({ type: 'invalid', reason: 'Game ID already exists. Choose a different ID.' }));
            }
        } else if (data.type === 'join') {
            if (games[gameId]) {
                const gameInstance = games[gameId];

                if (gameInstance.players[1] === null) {

                    gameInstance.players[1] = ws;
                    ws.send(JSON.stringify({ type: 'join', player: 2 }));
                    gameInstance.players[0].send(JSON.stringify({ type: 'message', text: 'Second player joined. The game is starting!' }));
                    ws.send(JSON.stringify({ type: 'message', text: 'You have joined the game!' }));


                    const gameStartMessage = {
                        type: 'start',
                        board: gameInstance.game.board,
                        currentPlayer: 1
                    };
                    gameInstance.players[0].send(JSON.stringify(gameStartMessage));
                    gameInstance.players[1].send(JSON.stringify(gameStartMessage));


                    handlePlayerMessages(gameInstance, 1);
                    handlePlayerMessages(gameInstance, 2);
                } else {
                    ws.send(JSON.stringify({ type: 'invalid', reason: 'The game is already full.' }));
                }
            } else {
                ws.send(JSON.stringify({ type: 'invalid', reason: 'Game ID does not exist. Please create a new game or join an existing one.' }));
            }
        }
    });

    // Handle disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
        // clean up game if a player disconnects
        for (const gameId in games) {
            const gameInstance = games[gameId];
            if (gameInstance.players.includes(ws)) {
                gameInstance.players.forEach((playerWs) => {
                    if (playerWs && playerWs !== ws) {
                        playerWs.send(JSON.stringify({ type: 'message', text: 'Your opponent has disconnected. Game over.' }));
                    }
                });
                // remove game instances
                delete games[gameId]; 
                break;
            }
        }
    });
});

function handlePlayerMessages(gameInstance, playerNumber) {
    const playerWs = gameInstance.players[playerNumber - 1];
    const opponentWs = gameInstance.players[2 - playerNumber];

    playerWs.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'move') {
            const result = gameInstance.game.makeMove(playerNumber, data.from, data.to);
            if (result.success) {
                const updateMessage = {
                    type: 'update',
                    board: result.board,
                    currentPlayer: result.currentPlayer
                };
                playerWs.send(JSON.stringify(updateMessage));
                opponentWs.send(JSON.stringify(updateMessage));

                
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
                    delete games[data.gameId];


                }
            } else {
                playerWs.send(JSON.stringify({ type: 'invalid', reason: result.message }));
            }
        }
    });
}

server.listen(8080, () => {
    console.log('Server started on port 8080');
});