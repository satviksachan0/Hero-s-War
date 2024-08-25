let selectedPiece = null;

const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = (message) => {
    const data = JSON.parse(message.data);

    if (data.type === 'join') {
        document.getElementById('game-status').innerText = `You are Player ${data.player}`;
    } else if (data.type === 'message') {
        document.getElementById('game-status').innerText = data.text;
    } else if (data.type === 'start' || data.type === 'update') {
        renderBoard(data.board, data.currentPlayer);
        document.getElementById('game-status').innerText = `Player ${data.currentPlayer}'s turn`;
    } else if (data.type === 'invalid') {
        alert(data.reason);
    } else if (data.type === 'gameOver') {
        alert(`Game Over! ${data.winner} wins!`);
    }
};

function renderBoard(board, currentPlayer) {
    const boardElement = document.getElementById('game-board');
    boardElement.innerHTML = '';

    board.forEach((row, y) => {
        row.forEach((cell, x) => {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');

            if (cell) { // Check if there's a piece in this cell
                cellElement.classList.add(`player${cell.player}`);
                cellElement.innerText = cell.piece;

                // Allow selection of pieces only if it's the current player's turn
                if (cell.player === currentPlayer) {
                    cellElement.addEventListener('click', () => {
                        selectPiece(x, y);
                    });
                }
            }

            boardElement.appendChild(cellElement);

            // Highlight possible moves for selected piece
            if (selectedPiece && !cell) {
                cellElement.classList.add('highlight');
                cellElement.addEventListener('click', () => {
                    movePiece(selectedPiece, { x, y });
                });
            }
        });
    });
}


function selectPiece(x, y) {
    selectedPiece = { x, y };
    document.getElementById('game-status').innerText = `Selected piece at (${x + 1}, ${y + 1})`;
    renderBoard(currentBoard, currentPlayer);  // Update the board to show possible moves
}

function movePiece(from, to) {
    ws.send(JSON.stringify({
        type: 'move',
        from: from,
        to: to
    }));
    selectedPiece = null;  // Clear selection after the move
}

// Variables to track the current state
let currentBoard = [];
let currentPlayer = null;

// Save the board and current player state on each update
ws.onmessage = (message) => {
    const data = JSON.parse(message.data);

    if (data.type === 'update' || data.type === 'start') {
        currentBoard = data.board;
        currentPlayer = data.currentPlayer;
        renderBoard(currentBoard, currentPlayer);
    }

    // Handle other message types
    // ...
};
