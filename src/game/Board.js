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

        this._board = Array(this._rules.board.height + 10).fill(null)
            .map(() => Array(this._rules.board.width).fill("0"))
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
        return this._board[y][x];
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

    _fallingPieceCollidesWithBoard(fallingPiece)
    {
        for (let mino of fallingPiece.minos)
        {
            //if (this.getMinoOnBoard(mino.x, mino.y) !== "0")
            //    return true;
            
            //check if the mino is in bounds
            if (mino.x < 0 || mino.x >= this._rules.board.width)
                return true;
            //if (mino.y >= this._rules.board.height)
            //    return true;
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

        if (_fallingPieceCollidesWithBoard(this.currentPiece))
        {
            console.warn("Could not lock the current piece onto the board");
            return;
        }

        let newBoard = deepCopy(this._board);
        for (mino of this._currentPiece.minos)
            newBoard[mino.y][mino.x] = this.currentPiece.type;
    }

    _spawnNextPiece()
    {
        let newFallingPiece = new FallingPiece(this._nextQueue.shift());
        newFallingPiece.x = this._rules.board.width / 2;
        newFallingPiece.y -= 1;

        this._currentPiece = newFallingPiece;

        //refill next queue
        if (this._nextQueue.length < 5)
            this._nextQueue.push(this._rules.pieceGeneration(this._nextQueue))
    }
}