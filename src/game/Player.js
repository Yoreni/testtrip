class Player
{
    constructor(rules)
    {
        this._rules = {
            board: {
                width: 10,
                height: 20
            },
            pieceGeneration: sevenBag,
            rotationSystem: SRSPlusKicktable,
            lockDelay: 31,
            maxLockResets: 15,
            gravitiy: 1 / 60,
            hold: 2,                    //0 = off, 1 = on, 2 = on (infinite hold)
            ARE: 0,
            lineARE: 0 
        }

        this._board = new Playfield(this._rules.board.width, this._rules.board.height);
        this._nextQueue = this._rules.pieceGeneration([]);
        this._currentPiece = undefined;
        this._hold = null;
        this._hasHeld = false;
        this._stats = {start: new Date()};  //assuming the game starts as soon as the object is constructed
        this._hold = null;
        this._holdUsed = false;
        this._alive = true;
        this._AREtimer = 0;

        this._spawnNextPiece();
    }

    get currentPiece()
    {
        return this._currentPiece;
    }

    get nextQueue()
    {
        return this._nextQueue;
    }

    get holdPiece()
    {
        return this._hold;
    }

    get holdUsed()
    {
        return this._rules.hold === 2 ? false : this._holdUsed;
    }

    get board()
    {
        return this._board;
    }

    get isAlive()
    {
        return this._alive;
    }

    get AREtimer()
    {
        return this._AREtimer;
    }

    get time()
    {
        return ((new Date()) - this._stats.start) / 1000;
    }

    set board(newBoard)
    {
        this._board = newBoard;
    }

    getMinoOnBoard(x, y)
    {
        return this._board.get(x, y);
    }

    softDrop()
    {
        const minSoftDrop = 1/60 * handling.SDF;

        let newPiece = this._currentPiece.copy();
        newPiece.move(0, -Math.max(minSoftDrop, this._rules.gravitiy * handling.SDF));
        if (!this._board.doesColide(newPiece))
            this._currentPiece = newPiece;
        else
            this._currentPiece = this.ghostPiece;
    }

    rotateClockwise()
    {
        this._currentPiece = this._rotate(1);
        this._resetLockDelay();
    }

    rotateAnticlockwise()
    {
        this._currentPiece = this._rotate(-1);
        this._resetLockDelay();
    }

    rotate180()
    {
        this._currentPiece = this._rotate(2);
        this._resetLockDelay();
    }

    _rotate(direction)
    {
        const kicktableType = this._rules.rotationSystem[this._currentPiece.type] === undefined 
                    ? "*" : this._currentPiece.type;
        const kicktableDirection = "" 
                        + this._currentPiece.rotation + mod(this._currentPiece.rotation + direction, 4);
        const kickData = this._rules.rotationSystem[kicktableType][kicktableDirection];
    
        for (let attempt = 0; attempt != kickData.length; ++attempt)
        {
            let piece = this._currentPiece.copy();
            piece.rotate(direction);
            piece.x += kickData[attempt].x;
            piece.y += kickData[attempt].y;
    
            if (!this._board.doesColide(piece))
                return piece;
        }
    
        //orginal piece gets returned if all kick table rotations failed
        return this.currentPiece;
    }

    harddrop()
    {
        this._currentPiece = this.ghostPiece;
        this._placeCurrentPiece();
    }

    hold()
    {
        if (this._AREtimer > 0)
            return;

        if (this._rules.hold === 0)
            return;

        if (this._rules.hold === 1 && this._holdUsed)
            return;

        //preform the hold action
        const oldHoldPiece = this._hold;
        this._hold = this._currentPiece.type;
        this._spawnNextPiece(oldHoldPiece);

        this._holdUsed = true;
    }

    tick(delta)
    {
        if (!this._alive)
            return;
        if (this._AREtimer > 0)
        {
            --(this._AREtimer);
            return;
        }

        //move piece down by gravity
        const newPiece = this._currentPiece.copy();
        newPiece.move(0, -this._rules.gravitiy);
        if (!this._board.doesColide(newPiece))
            this._currentPiece = newPiece;
        else
            this._currentPiece = this.ghostPiece;

        if (this.ghostPiece.y == this._currentPiece.y)
        {
            ++(this._currentPiece.lockTimer)
            if (this._currentPiece.lockTimer >= this._rules.lockDelay)
                this._placeCurrentPiece();
        }
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

    //this function can be split up
    moveCurrentPiece(amount)
    {
        if (this._AREtimer > 0)
            return;

        const maxLeft = -leftToColision(this._currentPiece, this._board);
        const maxRight = rightToColision(this._currentPiece, this._board);

        let newPiece = this._currentPiece.copy();
        newPiece.move(Math.max(maxLeft, Math.min(amount, maxRight)), 0);
        if (!this._board.doesColide(newPiece))
            this._currentPiece = newPiece;

        this._resetLockDelay();
    }

    //this resets the lock delay of a piece if it got moved whiile locking
    _resetLockDelay()
    {
        if (this.currentPiece.lockTimer > 0)
        {
            this.currentPiece.lockTimer = 0;
            ++(this.currentPiece.lockResets);
            if (this.currentPiece.lockResets > this._rules.maxLockResets)
                this._placeCurrentPiece();
        }
    }

    _placeCurrentPiece()
    {
        const spin = this._inmovableSpinDetection();
        this._lockCurrentPiece();

        const linesClearedThisPiece = this._board.completedLines.length
        if (linesClearedThisPiece > 0)
        {
            if (this._stats.linesCleared == undefined)
                this._stats.linesCleared = {}
            //total lines summing each key * its value
            ++(this._stats.linesCleared[linesClearedThisPiece])
        }

        if (spin > 0)
        {
            if (this._stats.spins == undefined)
                this._stats.spins = {1: {}, 2: {}}
            if (this._stats.spins[spin][this._currentPiece.type] == undefined)
                this._stats.spins[spin][this._currentPiece.type] = {}
            if (this._stats.spins[spin][this._currentPiece.type][linesClearedThisPiece] == undefined)
                this._stats.spins[spin][this._currentPiece.type][linesClearedThisPiece] = 0
            
            ++(this._stats.spins[spin][this._currentPiece.type][linesClearedThisPiece])
            console.log(this._stats.spins);
        }


        for (let clearedLineY of this._board.completedLines)
            this._board.clearLine(clearedLineY);

        this._AREtimer = linesClearedThisPiece > 0 ? this._rules.lineARE : this._rules.ARE;
        this._spawnNextPiece();

        this._stats.piecesPlaced += 1
    }

    //only for t pieces
    //0 = no spin, 1 = mini spin, 2 = full spin
    _3cornerSpinDetection()
    {
        if (this._currentPiece.type !== "T")
            return 0;

        //TODO: check here if the last action was a succsessful rotation

        const centerX = this._currentPiece.x - 1;
        const centerY = this._currentPiece.y - 1;
        
        const ocupiedCorners = this._board.doesColide({x: centerX + 1, y: centerY + 1})
                             + this._board.doesColide({x: centerX + 1, y: centerY - 1})
                             + this._board.doesColide({x: centerX - 1, y: centerY + 1})
                             + this._board.doesColide({x: centerX - 1, y: centerY - 1});
        
        if (ocupiedCorners >= 3)
            return 2;
        if (ocupiedCorners === 2)
            return 1;
        return 0;

    }

    _inmovableSpinDetection()
    {
        let pieceUp = this._currentPiece.copy();
        pieceUp.y += 1;

        let pieceLeft = this._currentPiece.copy();
        pieceLeft.x -= 1;

        let pieceRight = this._currentPiece.copy();
        pieceRight.x += 1;

        if (this._board.doesColide(pieceUp) && this._board.doesColide(pieceLeft) 
                && this._board.doesColide(pieceRight))
            return 2;
        return 0;
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

        //check for topout
        if (Math.min(...this.currentPiece.minos.map(element => element.y)) >= this._board.height)
        {
            this._alive = false;
        }

        let newBoard = this._board.copy();
        for (let mino of this._currentPiece.minos)
            newBoard.set(mino.x, mino.y, this.currentPiece.type);

        this._board = newBoard;
        this._holdUsed = false;             //refresh hold
    }

    /*
        spawns a new falling piece on the playfield and cancels the old one.
        if a type is specified then it spawns one of that type otherwise it
        gets the next that is next in the next queue.
     */
    _spawnNextPiece(type = null)
    {
        if (type == null)
        {
            if (this._nextQueue.length === 0)
                throw "Could not spawn piece because the next queue is empty"
            type = this._nextQueue.shift()
        }

        let newFallingPiece = new FallingPiece(type);
        newFallingPiece.x = this.board.width / 2;

        const lowestY = Math.min(...newFallingPiece.minos.map(mino => mino.y))
        //- lowestY + 1 makes the piece spawns 1 unit above the board
        newFallingPiece.y = this.board.height - lowestY + 1;

        //check for topout
        if (this._board.doesColide(newFallingPiece))
        {
            this._alive = false;
            return;
        }


        this._currentPiece = newFallingPiece;

        //refill next queue
        if (this._nextQueue.length < 5)
            this._nextQueue.push(...this._rules.pieceGeneration(this._nextQueue))
    }
}
