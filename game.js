class Game {
    constructor() {
        this.board = this.createBoard();
        this.players = [];
        this.currentPlayerIndex = 0; // Keep track of current player
        this.initializeBoard(); // Initialize the board during construction
    }

    initializeBoard() {
        // Define the initial setup of pieces for a 5x5 board
        this.board = [
            [{ player: 1, piece: 'P1' }, { player: 1, piece: 'H1' }, { player: 1, piece: 'H2' }, { player: 1, piece: 'H1' }, { player: 1, piece: 'P1' }],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [{ player: 2, piece: 'P1' }, { player: 2, piece: 'H1' }, { player: 2, piece: 'H2' }, { player: 2, piece: 'H1' }, { player: 2, piece: 'P1' }]
        ];
    }

    createBoard() {
        return Array(5).fill().map(() => Array(5).fill(null));
    }

    addPlayer(player) {
        if (this.players.length < 2) {
            this.players.push(player);
            return true;
        }
        return false;
    }

    // Implement game rules, move validation, and state updates here
    makeMove(player, from, to) {
        console.log('Move received:', player, from, to);
        const piece = this.board[from.y][from.x];

        if (!piece || piece.player !== player) {
            console.log("Invalid Move");
            return { success: false, message: 'Invalid move' };
        }

        // Example logic to move the piece
        this.board[to.y][to.x] = piece; // Move the piece to the new position
        this.board[from.y][from.x] = null; // Clear the old position

        // Switch turns
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 2;

        return { success: true, board: this.board, currentPlayer: this.currentPlayerIndex + 1 };
    }
}

class Character {
    constructor(type) {
        this.type = type;
    }
}

class Pawn extends Character {
    constructor() {
        super('Pawn');
    }

    // Define movement logic
}

class Hero1 extends Character {
    constructor() {
        super('Hero1');
    }

    // Define movement logic
}

class Hero2 extends Character {
    constructor() {
        super('Hero2');
    }

    // Define movement logic
}

// const game = new Game();
// const result = game.makeMove(1, { x: 0, y: 0 }, { x: 2, y: 2 });
// console.log(result);

module.exports = Game;
