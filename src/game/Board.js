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
            .map(() => Array(this._rules.board.width).fill(0))
        this._currentPiece = undefined;
        this._nextQueue = [].push(rules.pieceGeneration([]));
        this._hold = null;
        this._hasHeld = false;
        this._stats = {};
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