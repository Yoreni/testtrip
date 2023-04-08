class Playfield
{
    constructor(width, height)
    {
        this._width = width;
        this._height = height;
        this._board = Array(height + 10).fill(null)
            .map(() => Array(width).fill("0"))
    }

    get width()
    {
        return this._width;
    }

    get height()
    {
        return this._height;
    }

    get(x, y)
    {
        return this._board[this._yToArrayIndex(y)][x]
    }

    set(x, y, mino)
    {
        this._board[this._yToArrayIndex(y)][x] = mino;
    }

    clearLine(y)
    {
        this._board.splice(this._yToArrayIndex(y), 1);
        this._board.push(Array(width).fill("0"))
    }

    copy()
    {
        let copy = new Playfield(this.width, this.height);
        for (let y = 0; y != this.height + 10; ++y)
        {
            for (let x = 0; x != this.width; ++x)
                copy.set(x, y, this.get(x, y));
                //copy._board[y][x] = this._board[y][x];
        }

        return copy;
    }

    _yToArrayIndex(y)
    {
        return this._board.length - y - 1
    }
}

//maybe rename this to Player class
class Board
{
    constructor(rules)
    {
        this._rules = {
            board: {
                width: 10,
                height: 20
            },
            pieceGeneration: sevenBag
        }

        this._board = new Playfield(this._rules.board.width, this._rules.board.height);
        this._nextQueue = this._rules.pieceGeneration([]);
        console.log(this._nextQueue)
        this._currentPiece = undefined;
        this._hold = null;
        this._hasHeld = false;
        this._stats = {};

        this._spawnNextPiece();
    }

    get currentPiece()
    {
        return this._currentPiece;
    }

    get board()
    {
        return this._board;
    }

    set board(newBoard)
    {
        this._board = newBoard;
    }

    getMinoOnBoard(x, y)
    {
        return this._board.get(x, y);
    }

    movePieceLeft()
    {
        this._currentPiece.x -= 1;
        if (this._fallingPieceCollidesWithBoard(this._currentPiece))
        {
            this._currentPiece.x += 1;
            return;
        }
    }

    movePieceRight()
    {
        this._currentPiece.x += 1;
        if (this._fallingPieceCollidesWithBoard(this._currentPiece))
        {
            this._currentPiece.x -= 1;
            return;
        }
    }

    softDrop()
    {
        this._currentPiece.y -= 1;
        if (this._fallingPieceCollidesWithBoard(this._currentPiece))
        {
            this._currentPiece.y += 1;
            return;
        }
    }

    _fallingPieceCollidesWithBoard(fallingPiece)
    {
        for (let mino of fallingPiece.minos)
        {
            //if (this.getMinoOnBoard(mino.x, mino.y) !== "0")
            //    return true;
            
            //check if the mino is in bounds
            if (mino.x < 0 || mino.x >= this._board.width)
                return true;
            if (mino.y < 0)
                return true;
        }
        return false;
    }

    _lockCurrentPiece()
    {
        if (this.currentPiece === undefined)
        {
            console.error("cannot lock an undefined piece");
            return;
        }

        if (this._fallingPieceCollidesWithBoard(this.currentPiece))
        {
            console.warn("Could not lock the current piece onto the board");
            return;
        }

        let newBoard = this._board.copy();
        console.log(newBoard);
        for (let mino of this._currentPiece.minos)
        {
            console.log(mino)
            newBoard.set(mino.x, mino.y, this.currentPiece.type);
        }

        this._board = newBoard;
    }

    _spawnNextPiece()
    {
        if (this._nextQueue.length === 0)
            throw "Could not spawn piece because the next queue is empty"

        let newFallingPiece = new FallingPiece(this._nextQueue.shift());
        newFallingPiece.x = this.board.width / 2;

        const lowestY = Math.min(...newFallingPiece.minos.map(mino => mino.y))
        //- lowestY + 1 makes the piece spawns 1 unit above the board
        newFallingPiece.y = this.board.height - lowestY + 1;

        this._currentPiece = newFallingPiece;

        //refill next queue
        if (this._nextQueue.length < 5)
            this._nextQueue.push(this._rules.pieceGeneration(this._nextQueue))
    }
}