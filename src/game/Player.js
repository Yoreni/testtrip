class Player
{
    #id;

    static defaultRules = {
        board: {
            width: 10,
            height: 20,
        },
        pieceGeneration: sevenBag,
        rotationSystem: SRSXkicktable,
        lockDelay: 31,
        maxLockResets: 15,
        gravitiy: 0,
        hold: 2,                    //0 = off, 1 = on, 2 = on (infinite hold)
        ARE: 0,
        lineARE: 0,
        pieceRoster: ["I", "O", "T", "S", "Z", "J", "L"]
    }

    constructor(rules, id)
    {
        this._rules = saveOptionsWithDeafults(rules, Player.defaultRules)
        this.#id = id;
        this._board = new Playfield(this._rules.board.width, this._rules.board.height);
        this._topupNextQueue();
        this._currentPiece = undefined;
        this._stats = this._initStats();
        this._hold = null;
        this._holdUsed = false;
        this._alive = true;
        this._AREtimer = 0;

        this._spawnNextPiece();
        eventManager.callEvent("onGameStart", {player: this})
    }

    get id()
    {
        return this.#id;
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
        return this._stats.end === undefined;
    }

    get AREtimer()
    {
        return this._AREtimer;
    }

    get piecesPlaced()
    {
        return this._stats.piecesPlaced
    }

    get time()
    {
        if (this.isAlive)
            return ((new Date()) - this._stats.start) / 1000;
        return (this._stats.end - this._stats.start) / 1000;
    }

    get linesCleared()
    {
        return Object.entries(this._stats.linesCleared).reduce((accumlator, currcentValue) =>
        {
            let [numOfLines, amount] = currcentValue;
            //console.log(numOfLines, "*", amount);
            return accumlator + (numOfLines * amount);
        }, 0)
    }

    get combo()
    {
        return this._stats.combo;
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
            {
                this.callEvent("onPieceRotate", 
                {
                    kickUsed: attempt,
                    direction: direction
                })
                return piece;
            }
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
        this.callEvent("onHold")
    }

    tick(delta)
    {
        if (!this._alive)
            return;
        if (this._AREtimer > 0)
        {
            --(this._AREtimer);
            if (this._AREtimer === 0)
                this.callEvent("AREend")
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
        this._AREtimer = linesClearedThisPiece > 0 ? this._rules.lineARE : this._rules.ARE;

        this.callEvent("onPieceLock", {
            oldBoard: this._board.copy(),
            clearedLines: linesClearedThisPiece,
            spinType: spin
        })

        this._board.clearLines(this._board.completedLines)

        this._spawnNextPiece();
        this.callEvent("onPiecePlace");
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
            this._markTopout();

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
        newFallingPiece.x = Math.ceil(this.board.width / 2);

        const lowestY = Math.min(...newFallingPiece.minos.map(mino => mino.y))
        //- lowestY + 1 makes the piece spawns 1 unit above the board
        newFallingPiece.y = this.board.height - lowestY + 1;

        //check for topout
        if (this._board.doesColide(newFallingPiece))
        {
            this._markTopout();
            return;
        }

        this._currentPiece = newFallingPiece;
        this._topupNextQueue();
    }

    _markTopout()
    {
        this._stats.end = new Date();
        this._alive = false;
    }

    _initStats()
    {
        return {
            start: new Date(),       //assuming the game starts as soon as the object is constructed
            perfectClears: 0,
            combo: 0,
            piecesPlaced: 0,
            spins: {
                "1": {       //mini spins 

                },
                "2": {      //normal spins

                }
            },
            linesCleared: {},
        };
    }

    _topupNextQueue()
    {
        if (this._nextQueue === undefined)
            this._nextQueue = [];
        while (this._nextQueue.length < 5)
            this._nextQueue.push(...this._rules.pieceGeneration(this._nextQueue, this._rules.pieceRoster))
    }
}

//this tracks basic stats
eventManager.addEvent("onPieceLock", (e) => 
{
    if (e.clearedLines > 0)
    {
        let count = e.player._stats.linesCleared[e.clearedLines];
        if (e.player._stats.linesCleared[e.clearedLines] == undefined)
            e.player._stats.linesCleared[e.clearedLines] = 0;
        ++(e.player._stats.linesCleared[e.clearedLines])
    }

    if (e.spin > 0)
    {
        if (e.player._stats.spins[spin][e.player.currentPiece.type] == undefined)
            e.player._stats.spins[spin][e.player.currentPiece.type] = {}
        if (e.player._stats.spins[spin][e.player.currentPiece.type][e.clearedLines] == undefined)
            e.player._stats.spins[spin][e.player.currentPiece.type][e.clearedLines] = 0
    
         ++(e.player._stats.spins[spin][e.player.currentPiece.type][e.clearedLines])
    }

    if (e.clearedLines > 0)
        ++(e.player._stats.combo);
    else
        e.player._stats.combo = 0;

    e.player._stats.piecesPlaced += 1;
});

eventManager.addEvent("onPiecePlace", (e) => 
{
    if (e.player.board.isPc)
        ++(e.player._stats.perfectClears)
});