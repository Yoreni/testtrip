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
            pieceGeneration: sevenBag,
            rotationSystem: SRS
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
        if (this._board.doesColide(this._currentPiece))
            this._currentPiece.x += 1;
    }

    movePieceRight()
    {
        this._currentPiece.x += 1;
        if (this._board.doesColide(this._currentPiece))
            this._currentPiece.x -= 1;
    }

    softDrop()
    {
        this._currentPiece.y -= 1;
        if (this._board.doesColide(this._currentPiece))
            this._currentPiece.y += 1;
    }

    rotateClockwise()
    {
        this._currentPiece = this._rules.rotationSystem(1, this._currentPiece, this._board);
    }

    rotateAnticlockwise()
    {
        this._currentPiece = this._rules.rotationSystem(-1, this._currentPiece, this._board);
    }

    rotate180()
    {
        //this._currentPiece = this._rules.rotationSystem(1, this._currentPiece, this._board);
         this._currentPiece.rotate(2);
         if (this._board.doesColide(this._currentPiece))
             this._currentPiece.rotate(-2);
    }

    harddrop()
    {
        console.log("ghostpiece: ", this.ghostPiece)
        this._currentPiece = this.ghostPiece;
        this._lockCurrentPiece();
        this._spawnNextPiece();
    }

    tick(delta)
    {
        const newPiece = this._currentPiece.copy()
        newPiece.move(0, -1/60);
        if (!this._board.doesColide(newPiece))
            this._currentPiece = newPiece;
        //console.log(this._currentPiece.y)
        //console.log("delta", delta);
    }

    get ghostPiece()
    {
        //if the piece colides with somthing then ghostPiece == fallingPiece
        if (this._board.doesColide(this._currentPiece))
            return this._currentPiece;

        let ghostPiece = this._currentPiece.copy();
        while (!this._board.doesColide(ghostPiece))
            ghostPiece.y -= 1;
        ghostPiece.y += 1;             //1 above the place it would colide with other minos/bounds
        return ghostPiece;
    }

    _lockCurrentPiece()
    {
        if (this.currentPiece === undefined)
        {
            console.error("cannot lock an undefined piece");
            return;
        }

        if (this._board.doesColide(this.currentPiece))
        {
            console.warn("Could not lock the current piece onto the board");
            return;
        }

        let newBoard = this._board.copy();
        for (let mino of this._currentPiece.minos)
            newBoard.set(mino.x, mino.y, this.currentPiece.type);

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
            this._nextQueue.push(...this._rules.pieceGeneration(this._nextQueue))
    }
}