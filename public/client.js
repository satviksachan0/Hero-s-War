// public/client.js
const ws = new WebSocket('ws://localhost:8080');
let player = null;
let board = Array(5).fill().map(() => Array(5).fill(null));
let selectedCell = null;

ws.onopen = () => {
    console.log('Connected to server');
    ws.send(JSON.stringify({ type: 'join' }));
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log('Received:', message);

    switch (message.type) {
        case 'join':
            player = message.player;
            document.getElementById('turn').textContent = `You are Player ${player}`;
            break;
        case 'start':
            document.getElementById('turn').textContent = `Player ${message.currentPlayer}'s turn`;
            document.getElementById('startGame').disabled = true;
            renderBoard(message.board);
            break;
        case 'update':
            board = message.board;
            renderBoard(board);
            document.getElementById('turn').textContent = `Player ${message.currentPlayer}'s turn`;
            break;
        case 'invalid':
            alert(message.reason);
            break;
        case 'gameOver':
            alert(`Game over! Winner: Player ${message.winner}`);
            document.getElementById('startGame').disabled = false;
            break;
        default:
            console.log('Unknown message type:', message.type);
    }
};

function renderBoard(board) {
    const grid = document.getElementById('board');
    grid.innerHTML = ''; // Clear the grid
    board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellDiv = document.createElement('div');
            cellDiv.className = `cell ${cell ? `player${cell.player}` : 'empty'}`;
            cellDiv.textContent = cell ? cell.type : '';
            cellDiv.addEventListener('click', () => handleCellClick(rowIndex, colIndex));
            grid.appendChild(cellDiv);
        });
    });
}

function handleCellClick(row, col) {
    if (selectedCell) {
        // Attempt to make a move
        ws.send(JSON.stringify({
            type: 'move',
            from: selectedCell,
            to: { row, col }
        }));
        selectedCell = null;
    } else {
        // Select a cell to move
        if (board[row][col] && board[row][col].player === player) {
            selectedCell = { row, col };
            highlightMoves(row, col);
        }
    }
}

function highlightMoves(row, col) {
    // Highlight valid moves for the selected piece (simple example)
    document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('highlight'));
    if (board[row][col].type === 'Pawn') {
        const possibleMoves = [
            { r: row - 1, c: col }, // Up
            { r: row + 1, c: col }, // Down
            { r: row, c: col - 1 }, // Left
            { r: row, c: col + 1 }  // Right
        ];
        possibleMoves.forEach(move => {
            if (isInBounds(move.r, move.c) && !board[move.r][move.c]) {
                document.querySelectorAll('.cell')[move.r * 5 + move.c].classList.add('highlight');
            }
        });
    }
}

function isInBounds(row, col) {
    return row >= 0 && row < 5 && col >= 0 && col < 5;
}

document.getElementById('startGame').addEventListener('click', () => {
    ws.send(JSON.stringify({ type: 'start' }));
});
