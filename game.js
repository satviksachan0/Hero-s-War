class Game {
    constructor() {
        this.board = this.createBoard();
        this.players = [];
        this.currentPlayerIndex = 0;
        //initializing the board to start a game
        this.initializeBoard();
    }
    //empty board
    createBoard() {
        return Array(5).fill().map(() => Array(5).fill(null));
    }


    checkForWinner() {
        const player1Pieces = this.board.flat().filter(cell => cell && cell.player === 1);
        const player2Pieces = this.board.flat().filter(cell => cell && cell.player === 2);

        if (player1Pieces.length === 0) {
            return 2; // Player 2 wins
        } else if (player2Pieces.length === 0) {
            return 1; // Player 1 wins
        }
        return null; // No winner yet
    }

    initializeBoard() {
        this.board = [
            [{ player: 1, piece: new Pawn() }, { player: 1, piece: new Hero1() }, { player: 1, piece: new Hero2() }, { player: 1, piece: new Hero3() }, { player: 1, piece: new Pawn() }],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [{ player: 2, piece: new Pawn() }, { player: 2, piece: new Hero1() }, { player: 2, piece: new Hero2() }, { player: 2, piece: new Hero3() }, { player: 2, piece: new Pawn() }]
        ];
    }

    addPlayer(player) {
        if (this.players.length < 2) {
            this.players.push(player);
            return true;
        }
        return false;
    }

    makeMove(player, from, to) {
        console.log('Move received:', player, from, to);
        const piece = this.board[from.y][from.x];
        

        if (!piece || piece.player !== player) {
            console.log("Invalid Move");
            return { success: false, message: 'Invalid move' };
        }
        
        const targetCell = this.board[to.y][to.x];
        const moveValid = piece.piece.move(this.board, from, to);

        if(!moveValid)
            return { success: false, message: 'Invalid move' };
        

        if (targetCell && targetCell.player !== player) {
            console.log(`Capturing opponent's piece at (${to.x}, ${to.y})`);
            this.board[to.y][to.x] = piece;
            this.board[from.y][from.x] = null;
        } else if (!targetCell) {
            this.board[to.y][to.x] = piece;
            this.board[from.y][from.x] = null;
        } else {
            console.log("Invalid Move: Can't capture your own piece");
            return { success: false, message: 'Invalid move: Cannot capture your own piece' };
        }
    



        //check for winner after moves
        const winner = this.checkForWinner();
        if (winner) {
            return {
                success: true,
                gameOver: true,
                winner: `Player ${winner}`
            };
        }
        // update the current player after a successful move
        this.currentPlayerIndex = this.currentPlayerIndex === 0 ? 1 : 0;
        
        return { success: true, board: this.board, currentPlayer: this.currentPlayerIndex + 1 };
    }
    
}

// Characters of the game are defined here
class Character {
    constructor(type) {
        this.type = type;
    }

    isWithinBounds(x, y) {
        return x >= 0 && x < 5 && y >= 0 && y < 5;
    }

    move(board, from, to) {
        throw new Error("Should be in child class");
    }
}

class Pawn extends Character {
    constructor() {
        super('Pawn');
    }

    move(board, from, to) {
        const dx = Math.abs(from.x - to.x);
        const dy = Math.abs(from.y - to.y);


        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            const pathClear=!board[to.y][to.x]
            return this.isWithinBounds(to.x, to.y) && true;
        }
        return false;
    }
}

class Hero1 extends Character {
    constructor() {
        super('Hero1');
    }

    move(board, from, to) {
        const dx = Math.abs(from.x - to.x);
        const dy = Math.abs(from.y - to.y);


        if ((dx === 2 && dy === 0) || (dx === 0 && dy === 2)) {
            const pathClear = this.checkPath(board, from, to);
            return this.isWithinBounds(to.x, to.y) && pathClear;
        }
        return false;
    }

    checkPath(board, from, to) {
        const stepX = Math.sign(to.x - from.x);
        const stepY = Math.sign(to.y - from.y);

        let x = from.x + stepX;
        let y = from.y + stepY;

        while (x !== to.x || y !== to.y) {
            if (board[y][x] && board[y][x].player==board[from.y][from.x].player) {
                return false;
            }
            x += stepX;
            y += stepY;
        }
         x = from.x + stepX;
         y = from.y + stepY;

        while (x !== to.x || y !== to.y) {
            if (board[y][x]) {
                board[y][x]=null;
            }
            x += stepX;
            y += stepY;
        }

        return true;
    }
}

class Hero2 extends Character {
    constructor() {
        super('Hero2');
    }

    move(board, from, to) {
        const dx = Math.abs(from.x - to.x);
        const dy = Math.abs(from.y - to.y);

        if (dx === 2 && dy === 2) {

            return this.isWithinBounds(to.x, to.y) && this.checkPath(board, from, to);
        }
        return false;
    }

    checkPath(board, from, to) {
        const stepX = Math.sign(to.x - from.x);
        const stepY = Math.sign(to.y - from.y);

        let x = from.x + stepX;
        let y = from.y + stepY;
        const currp=board[from.y][from.x].player;
        if(board[y][x]){
            if(board[y][x].player==currp)
                return false;
        }
        if(board[to.y][to.x]){
            if(board[to.y][to.x].player==currp)
                return false;
        }
        board[y][x]=null;
        

        return !board[y][x];

    }
}
class Hero3 extends Character {
    constructor() {
        super('Hero3');
    }

    move(board, from, to) {
        const dx = Math.abs(from.x - to.x);
        const dy = Math.abs(from.y - to.y);


        const validMoves = [
            { dx: 2, dy: 1 }, { dx: 2, dy: -1 }, 
            { dx: -2, dy: 1 }, { dx: -2, dy: -1 }, 
            { dx: 1, dy: 2 }, { dx: -1, dy: 2 }, 
            { dx: 1, dy: -2 }, { dx: -1, dy: -2 } 
        ];


        if (validMoves.some(move => move.dx === dx && move.dy === dy)) {
            return this.isWithinBounds(to.x, to.y) && this.attackOnlyFinalPosition(board, from, to);
        }

        return false;
    }

    attackOnlyFinalPosition(board, from, to) {
        const targetCell = board[to.y][to.x];
        const currPlayer = board[from.y][from.x].player;

        if (targetCell && targetCell.player !== currPlayer) {

            board[to.y][to.x] = null;
        }


        board[to.y][to.x] = board[from.y][from.x];
        board[from.y][from.x] = null;

        return true;
    }
}


//teesting game
// const game = new Game();
// const result = game.makeMove(1, { x: 0, y: 0 }, { x: 2, y: 2 });
// console.log(result);

module.exports = Game;
