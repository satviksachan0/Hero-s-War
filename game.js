class Game {
    constructor() {
        this.board = this.createBoard();
        this.players = [];
        this.currentPlayerIndex = 0;
        this.initializeBoard();
    }

    createBoard() {
        return Array(5).fill().map(() => Array(5).fill(null));
    }

    initializeBoard() {
        this.board = [
            [{ player: 1, piece: new Pawn() }, { player: 1, piece: new Hero1() }, { player: 1, piece: new Hero2() }, { player: 1, piece: new Hero1() }, { player: 1, piece: new Pawn() }],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [{ player: 2, piece: new Pawn() }, { player: 2, piece: new Hero1() }, { player: 2, piece: new Hero2() }, { player: 2, piece: new Hero1() }, { player: 2, piece: new Pawn() }]
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
        const piece = this.board[from.y][from.x];
        if (!piece || piece.player !== player) {
            return { success: false, message: 'Invalid move' };
        }

        // Validate the move based on the piece's movement logic
        const moveValid = piece.piece.move(this.board, from, to);

        if (moveValid) {
            this.board[to.y][to.x] = piece; // Move the piece to the new position
            this.board[from.y][from.x] = null; // Clear the old position
            this.currentPlayerIndex = this.currentPlayerIndex === 0 ? 1 : 0; // Switch turns
            return { success: true, board: this.board, currentPlayer: this.currentPlayerIndex + 1 };
        } else {
            return { success: false, message: 'Invalid move' };
        }
    }
}


class Character {
    constructor(type) {
        this.type = type;
    }

    isWithinBounds(x, y) {
        return x >= 0 && x < 5 && y >= 0 && y < 5;
    }

    move(board, from, to) {
        throw new Error("This method should be overridden in child classes");
    }
}

class Pawn extends Character {
    constructor() {
        super('Pawn');
    }

    move(board, from, to) {
        const dx = Math.abs(from.x - to.x);
        const dy = Math.abs(from.y - to.y);

        // Pawn can only move one block in any direction
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            return this.isWithinBounds(to.x, to.y) && !board[to.y][to.x];
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

        // Hero1 can move two blocks straight in any direction
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
            if (board[y][x]) {
                return false;
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

        // Hero2 can move two blocks diagonally in any direction
        if (dx === 2 && dy === 2) {
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

        // Since Hero2 moves diagonally, there's only one step to check
        return !board[y][x];
    }
}


// const game = new Game();
// const result = game.makeMove(1, { x: 0, y: 0 }, { x: 2, y: 2 });
// console.log(result);

module.exports = Game;
