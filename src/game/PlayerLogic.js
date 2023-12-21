class PlayerLogic
{
    #id;
    /**
     * @type {Boolean}
     * for t-spin detection
     */
    #lastMovementASuccessfulSpin;

    static defaultRules = {
        board: {
            width: 10,
            height: 20,
        },
        pieceGeneration: sevenBag,
        rotationSystem: SRSXkicktable,
        lockDelay: 30,
        maxLockResets: 15,
        gravitiy: 1/60,
        hold: 2,                    //0 = off, 1 = on, 2 = on (infinite hold)
        ARE: 0,
        lineARE: 0,
        pieceRoster: ["I", "O", "T", "S", "Z", "J", "L"]
    }

    constructor(rules, id)
    {
        this._rules = saveOptionsWithDeafults(rules, PlayerLogic.defaultRules)
        this.random = new Random(rules.seed ?? new Date().getTime());
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
    }

    get id()
    {
        return this.#id;
    }

    /**
     * @returns {FallingPiece}
     */
    get currentPiece()
    {
        return this._currentPiece;
    }

    /**
     * gets the next queue
     */
    get nextQueue()
    {
        return this._nextQueue;
    }

    /**
     * Gets the type of piece in the hold slot
     * 
     * @returns {string}
     */
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

    /**
     * true if the player is still playing.
     * 
     * @returns {boolean}
     */
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

    /**
     * calculates pieces per second
     * @returns {Number}
     */
    get pps()
    {
        return this.piecesPlaced / this.time
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

    softDrop()
    {
        const minSoftDrop = 1/60 * handling.SDF;
        const oldY = this._currentPiece.y

        let newPiece = this._currentPiece.copy();
        newPiece.move(0, -Math.max(minSoftDrop, this._rules.gravitiy * handling.SDF));
        if (!this._board.doesColide(newPiece))
            this._currentPiece = newPiece;
        else
            this._currentPiece = this.ghostPiece;

        if (oldY !== this._currentPiece.y)
            this.#lastMovementASuccessfulSpin = false;
        
        this.callEvent("onSoftDrop", 
        {
            distance: oldY - this._currentPiece.y
        })
    }

    rotateClockwise()
    {
        this.#lastMovementASuccessfulSpin = this._rotate(1);
        if (this._currentPiece.x == this.ghostPiece.x)
            this._resetLockDelay();
    }

    rotateAnticlockwise()
    {
        this.#lastMovementASuccessfulSpin = this._rotate(-1);
        if (this._currentPiece.x == this.ghostPiece.x)
            this._resetLockDelay();
    }

    rotate180()
    {
        this.#lastMovementASuccessfulSpin = this._rotate(2);
        if (this._currentPiece.x == this.ghostPiece.x)
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
            
            if (!this._board.doesColide(piece, true))
            {
                this._currentPiece = piece;
                this.callEvent("onPieceRotate", 
                {
                    kickUsed: attempt,
                    direction: direction
                })
                return true;
            }
        }

        return false;
    }

    harddrop()
    {
        const oldY = this._currentPiece.y
        this._currentPiece = this.ghostPiece;
        const newY = this._currentPiece.y

        this._placeCurrentPiece();

        if (oldY !== newY)
            this.#lastMovementASuccessfulSpin = false;

        this.callEvent("onHardDrop", 
        {
            distance: oldY - newY
        })
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

        this.#lastMovementASuccessfulSpin = false;
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
        amount = Math.max(maxLeft, Math.min(amount, maxRight))

        let newPiece = this._currentPiece.copy();
        newPiece.move(amount, 0);
        if (!this._board.doesColide(newPiece))
        {
            const oldX = this._currentPiece.x;
            this._currentPiece = newPiece;

            if (oldX != this._currentPiece.x)
            {
                this.#lastMovementASuccessfulSpin = false;
                this._resetLockDelay();
                this.callEvent("onPieceMove", 
                {
                    //positive is right, negitive is left
                    distance: this._currentPiece.x - oldX
                });
            }
        }
    }


    /**
     * this resets the lock delay of a piece if it got moved whiile locking
     * 
     * this also modifies the this.currentPiece object
     * 
     * @returns nothing
     */
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
        const spin = this.currentPiece.type === "T"
            ? this._3cornerSpinDetection()
            : this._inmovableSpinDetection();
        console.log(spin)
        this._lockCurrentPiece();

        const linesClearedThisPiece = this._board.completedLines.length
        this._AREtimer = linesClearedThisPiece > 0 ? this._rules.lineARE : this._rules.ARE;

        this.callEvent("onPieceLock", {
            oldBoard: this._board.copy(),
            clearedLines: linesClearedThisPiece,
            spinType: spin,
            piece: this.currentPiece.copy()
        })

        this._board.clearLines(this._board.completedLines)
        this._spawnNextPiece();

        this.callEvent("onPiecePlace");
    }

    //only for t pieces
    _3cornerSpinDetection()
    {
        if (this._currentPiece.type !== "T")
            return SpinType.NONE;
        if (this.#lastMovementASuccessfulSpin !== true)
            return SpinType.NONE;

        const corners = getPieceCorners(this._currentPiece.type, this._currentPiece.rotation)
        if (corners === null)
            return SpinType.NONE;

        const centerX = this._currentPiece.x;
        const centerY = this._currentPiece.y;

        const cornerCount = (() =>
        {
            let count = 0
            for (const corner of corners.primary.concat(corners.secondary))
            {
                if (this._board.doesColide(Point(centerX + corner.x, centerY +  corner.y)))
                    ++count
            }
            return count;
        })()
        if (cornerCount < 3)
            return SpinType.NONE;

        const coverdPrimaryCorners = corners.primary.every(corner => this._board.doesColide(Point(centerX + corner.x, centerY +  corner.y)))
        const coverdSecondaryCorners = corners.secondary.some(corner => this._board.doesColide(Point(centerX + corner.x, centerY +  corner.y)))

        if (!coverdPrimaryCorners)
            return SpinType.MINI;
        else if (coverdPrimaryCorners && coverdSecondaryCorners)
            return SpinType.FULL;
        return SpinType.NONE;
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
            return SpinType.FULL;
        return SpinType.NONE;
    }

    /**
     * This function puts the piece on the playfield
     * 
     * @returns nothing
     */
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
        newFallingPiece.x = Math.ceil(this.board.width / 2) - 1;

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
            this._nextQueue.push(...this._rules.pieceGeneration(this))
    }

    /**
     * used for testing bots
     * @param {*} rotation 
     * @param {*} x 
     * @param {*} y 
     */
    // plonkCurrentPiece(rotation, x, y)
    // {
    //     while (this.currentPiece.rotation !== rotation)
    //         this.currentPiece.rotate(1)

    //     this.currentPiece.x = x;
    //     if (y !== undefined)
    //         this.currentPiece.y = y
    //     else
    //         this.currentPiece.y = this.ghostPiece.y

    //     this._placeCurrentPiece();
    // }
}

//this tracks types of lines cleared
eventManager.addEvent("onPieceLock", (e) => 
{
    const logicPlayer = e.player.logic;
    if (e.clearedLines > 0)
    {
        if (logicPlayer._stats.linesCleared[e.clearedLines] == undefined)
            logicPlayer._stats.linesCleared[e.clearedLines] = 0;
        ++(logicPlayer._stats.linesCleared[e.clearedLines])
    }

    const spin = e.spinType
    if (spin !== SpinType.NONE)
    {
        //TODO change 2 to spin
        if (logicPlayer._stats.spins[2][logicPlayer.currentPiece.type] == undefined)
            logicPlayer._stats.spins[2][logicPlayer.currentPiece.type] = {}
        if (logicPlayer._stats.spins[2][logicPlayer.currentPiece.type][e.clearedLines] == undefined)
            logicPlayer._stats.spins[2][logicPlayer.currentPiece.type][e.clearedLines] = 0
    
         ++(logicPlayer._stats.spins[2][logicPlayer.currentPiece.type][e.clearedLines])

         console.info("t-spin " + (["","single","double", "triple", "quadruple"][e.clearedLines]))
    }

    if (e.clearedLines > 0)
        ++(logicPlayer._stats.combo);
    else
        logicPlayer._stats.combo = 0;

    logicPlayer._stats.piecesPlaced += 1;
});

eventManager.addEvent("onPiecePlace", (e) => 
{
    const logicPlayer = e.player.logic;
    if (logicPlayer.board.isPc)
        ++(logicPlayer._stats.perfectClears)
});