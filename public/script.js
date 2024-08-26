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
            alert(`Game Over! Player ${data.winner}: you win!!!`);
            break;
        case 'loser':
            alert('You Lost. Try again next time!');
            break;
    }
});

function handleJoin(player) {
    if(player==1)
        updateStatus2(`You are Player ${player}, BLUE`);
    else    
        updateStatus2(`You are Player ${player}, RED`);
    // updateStatus(`You are Player ${player}`);
}

function updateGame(board, player) {
    currentBoard = board;
    currentPlayer = player;
    updateStatus(`Player ${player}'s turn`);
    renderBoard(board, player);
}

function updateStatus(status) {
    document.getElementById('game-status').innerText = status;
    // document.getElementById('player-designation').innerText=status;
}
function updateStatus2(status) {
    // document.getElementById('game-status').innerText = status;
    document.getElementById('player-designation').innerText=status;
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

function createCellElement(cell, x, y, player) {
    const cellElement = document.createElement('div');
    cellElement.classList.add('cell');

    if (cell) {
        cellElement.classList.add(`player${cell.player}`);
        cellElement.innerText = cell.piece.type;  // Extract the piece name directly

        if (cell.player === player) {
            cellElement.addEventListener('click', () => {
                selectPiece(x, y);
            });
        }
    }

    return cellElement;
}

function highlightPossibleMoves(board, from, player) {
    const pieceType = board[from.y][from.x].piece.type;
    const possibleMoves = getPossibleMoves(board, from, pieceType, player);

    possibleMoves.forEach(({ x, y }) => {
        const cellElement = document.querySelector(`#game-board .cell:nth-child(${y * 5 + x + 1})`);
        
        // Highlight the cell
        cellElement.classList.add('highlight');
        
        // Add the click event to make the move
        cellElement.addEventListener('click', () => {
            movePiece(from, { x, y });
        });
    });
}

function getPossibleMoves(board, from, pieceType, player) {
    const moves = [];
    const directions = [];

    switch (pieceType) {
        case 'Pawn':
            directions.push({ dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 });
            break;
        case 'Hero1':
            directions.push({ dx: 0, dy: 2 }, { dx: 0, dy: -2 }, { dx: 2, dy: 0 }, { dx: -2, dy: 0 });
            break;
        case 'Hero2':
            directions.push({ dx: 2, dy: 2 }, { dx: 2, dy: -2 }, { dx: -2, dy: 2 }, { dx: -2, dy: -2 });
            break;
    }

    directions.forEach(({ dx, dy }) => {
        const newX = from.x + dx;
        const newY = from.y + dy;

        // Ensure the move is within bounds and either empty or contains an opponent's piece
        if (newX >= 0 && newX < 5 && newY >= 0 && newY < 5) {
            const targetCell = board[newY][newX];
            if (!targetCell || targetCell.player !== player) {
                moves.push({ x: newX, y: newY });
            }
        }
    });

    return moves;
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
