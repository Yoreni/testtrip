class Board
{
    constructor(rules)
    {
        this._rules = {
            board: {
                width: 10,
                height: 20
            }
        }

        this._board = Array(this._rules.board.height + 10).fill(null)
            .map(() => Array(this._rules.board.width).fill(0))
        this._currentPiece = undefined;
        this._nextQueue = [];
        this._hold = null;
        this._hasHeld = false;
        this._stats = {};
    }
}