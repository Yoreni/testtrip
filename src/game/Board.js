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
        this._currentPiece = undefined;
        this._nextQueue = [].push(rules.pieceGeneration([]));
        this._hold = null;
        this._hasHeld = false;
        this._stats = {};
    }

    get currentPiece()
    {
        return this._currentPiece;
    }

    _fallingPieceCollidesWithBoard(fallingPiece)
    {
        for (mino of fallingPiece.minos)
        {
            if (newBoard[mino.y][mino.x] !== "0")
                return true;
        }
        return true;
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
        newFallingPiece.y = this._rules.board.height + 2;

        //refill next queue
        if (this._nextQueue.length < 5)
            this._nextQueue.push(this._rules.pieceGeneration(this._nextQueue))
    }
}