let selectedPiece = null;
let currentBoard = [];
let currentPlayer = null;

const ws = new WebSocket('ws://localhost:8080');

ws.addEventListener('open', () => {
    ws.send(JSON.stringify({ type: 'join' }));
    console.log('Connected to server');
});

ws.addEventListener('message', (message) => {
    const data = JSON.parse(message.data);

    switch (data.type) {
        case 'join':
            handleJoin(data.player);
            break;
        case 'message':
            updateStatus(data.text);
            break;
        case 'start':
        case 'update':
            updateGame(data.board, data.currentPlayer);
            break;
        case 'invalid':
            alert(data.reason);
            break;
        case 'gameOver':
            alert(`Game Over! ${data.winner} wins!`);
            break;
    }
});

function handleJoin(player) {
    updateStatus(`You are Player ${player}`);
}

function updateGame(board, player) {
    currentBoard = board;
    currentPlayer = player;
    updateStatus(`Player ${player}'s turn`);
    renderBoard(board, player);
}

function updateStatus(status) {
    document.getElementById('game-status').innerText = status;
}

function renderBoard(board, player) {
    const boardElement = document.getElementById('game-board');
    boardElement.innerHTML = '';

    board.forEach((row, y) => {
        row.forEach((cell, x) => {
            const cellElement = createCellElement(cell, x, y, player);
            boardElement.appendChild(cellElement);
        });
    });

    // Highlight possible moves if a piece is selected
    if (selectedPiece) {
        highlightPossibleMoves(board, selectedPiece, player);
    }
}

// function createCellElement(cell, x, y, player) {
//     const cellElement = document.createElement('div');
//     cellElement.classList.add('cell');

//     if (cell) {
//         cellElement.classList.add(`player${cell.player}`);
//         cellElement.innerText = cell.piece;

//         if (cell.player === player) {
//             cellElement.addEventListener('click', () => {
//                 selectPiece(x, y);
//             });
//         }
//     }

//     return cellElement;
// }
function createCellElement(cell, x, y, player) {
    const cellElement = document.createElement('div');
    cellElement.classList.add('cell');

    if (cell) {
        cellElement.classList.add(`player${cell.player}`);
        cellElement.innerText = cell.piece.type;  // Extract the piece name directly
        // console.log(cell.piece);
        if (cell.player === player) {
            cellElement.addEventListener('click', () => {
                selectPiece(x, y);
            });
        }
    }

    return cellElement;
}


function highlightPossibleMoves(board, from, player) {
    board.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (!cell) {
                const cellElement = document.querySelector(`#game-board .cell:nth-child(${y * 5 + x + 1})`);
                cellElement.classList.add('highlight');
                cellElement.addEventListener('click', () => {
                    movePiece(from, { x, y });
                });
            }
        });
    });
}

function selectPiece(x, y) {
    selectedPiece = { x, y };
    updateStatus(`Selected piece at (${x + 1}, ${y + 1})`);
    renderBoard(currentBoard, currentPlayer);
}

function movePiece(from, to) {
    ws.send(JSON.stringify({
        type: 'move',
        from: from,
        to: to
    }));
    selectedPiece = null;  // Clear selection after the move
}
