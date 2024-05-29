class PlayerLogic
{
    #id;
    /**
     * @type {Boolean}
     * for t-spin detection
     */
    #lastMovementASuccessfulSpin;
    #board;
    #currentPiece;
    #hold;
    #holdUsed;
    #alive
    #AREtimer;

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
        this.rules = saveOptionsWithDeafults(rules, PlayerLogic.defaultRules)
        this.random = new Random(rules.seed ?? new Date().getTime());
        this.#id = id;
        this.#board = new Playfield(this.rules.board.width, this.rules.board.height);
        this.#topupNextQueue();
        this.#currentPiece = undefined;
        this.stats = this.#initStats();
        this.#hold = null;
        this.#holdUsed = false;
        this.#alive = true;
        this.#AREtimer = 0;

        this.#spawnNextPiece();
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
        return this.#currentPiece;
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
        return this.#hold;
    }

    get holdUsed()
    {
        return this.rules.hold === 2 ? false : this.#holdUsed;
    }

    get board()
    {
        return this.#board;
    }

    /**
     * true if the player is still playing.
     * 
     * @returns {boolean}
     */
    get isAlive()
    {
        return this.stats.end === undefined;
    }

    get AREtimer()
    {
        return this.#AREtimer;
    }

    get piecesPlaced()
    {
        return this.stats.piecesPlaced
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
            return ((new Date()) - this.stats.start) / 1000;
        return (this.stats.end - this.stats.start) / 1000;
    }

    get linesCleared()
    {
        return Object.entries(this.stats.linesCleared).reduce((accumlator, currcentValue) =>
        {
            let [numOfLines, amount] = currcentValue;
            return accumlator + (numOfLines * amount);
        }, 0)
    }

    get combo()
    {
        return this.stats.combo;
    }

    set board(newBoard)
    {
        this.#board = newBoard;
    }

    softDrop()
    {
        const minSoftDrop = 1/60 * handling.SDF;
        const oldY = this.#currentPiece.y

        let newPiece = this.#currentPiece.copy();
        newPiece.move(0, -Math.max(minSoftDrop, this.rules.gravitiy * handling.SDF));
        if (!this.#board.doesColide(newPiece))
            this.#currentPiece = newPiece;
        else
            this.#currentPiece = this.ghostPiece;

        if (oldY !== this.#currentPiece.y)
            this.#lastMovementASuccessfulSpin = false;
        
        this.callEvent("onSoftDrop", 
        {
            distance: oldY - this.#currentPiece.y
        })
    }

    rotateClockwise()
    {
        this.#lastMovementASuccessfulSpin = this.#rotate(1);
        if (this.#currentPiece.x == this.ghostPiece.x)
            this.#resetLockDelay();
    }

    rotateAnticlockwise()
    {
        this.#lastMovementASuccessfulSpin = this.#rotate(-1);
        if (this.#currentPiece.x == this.ghostPiece.x)
            this.#resetLockDelay();
    }

    rotate180()
    {
        this.#lastMovementASuccessfulSpin = this.#rotate(2);
        if (this.#currentPiece.x == this.ghostPiece.x)
            this.#resetLockDelay();
    }

    #rotate(direction)
    {
        const kicktableType = this.rules.rotationSystem[this.#currentPiece.type] === undefined 
                    ? "*" : this.#currentPiece.type;
        const kicktableDirection = "" 
                        + this.#currentPiece.rotation + mod(this.#currentPiece.rotation + direction, 4);
        const kickData = this.rules.rotationSystem[kicktableType][kicktableDirection];
    
        for (let attempt = 0; attempt != kickData.length; ++attempt)
        {
            let piece = this.#currentPiece.copy();
            piece.rotate(direction);
            piece.x += kickData[attempt].x;
            piece.y += kickData[attempt].y;
            
            if (!this.#board.doesColide(piece, true))
            {
                this.#currentPiece = piece;
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
        const oldY = this.#currentPiece.y
        this.#currentPiece = this.ghostPiece;
        const newY = this.#currentPiece.y

        this.#placeCurrentPiece();

        if (oldY !== newY)
            this.#lastMovementASuccessfulSpin = false;

        this.callEvent("onHardDrop", 
        {
            distance: oldY - newY
        })
    }

    hold()
    {
        if (this.#AREtimer > 0)
            return;

        if (this.rules.hold === 0)
            return;

        if (this.rules.hold === 1 && this.#holdUsed)
            return;

        //preform the hold action
        const oldHoldPiece = this.#hold;
        this.#hold = this.#currentPiece.type;
        this.#spawnNextPiece(oldHoldPiece);

        this.#lastMovementASuccessfulSpin = false;
        this.#holdUsed = true;
        this.callEvent("onHold")
    }

    tick(delta)
    {
        if (!this.#alive)
            return;
        if (this.#AREtimer > 0)
        {
            --(this.#AREtimer);
            if (this.#AREtimer === 0)
                this.callEvent("AREend")
            return;
        }

        //move piece down by gravity
        const newPiece = this.#currentPiece.copy();
        newPiece.move(0, -this.rules.gravitiy);
        if (!this.#board.doesColide(newPiece))
            this.#currentPiece = newPiece;
        else
            this.#currentPiece = this.ghostPiece;

        if (this.ghostPiece.y == this.#currentPiece.y)
        {
            ++(this.#currentPiece.lockTimer)
            if (this.#currentPiece.lockTimer >= this.rules.lockDelay)
                this.#placeCurrentPiece();
        }
    }

    get ghostPiece()
    {
        //if the piece colides with somthing then ghostPiece == fallingPiece
        if (this.#board.doesColide(this.#currentPiece))
            return this.#currentPiece;

        let ghostPiece = this.#currentPiece.copy();
        while (!this.#board.doesColide(ghostPiece))
            ghostPiece.y -= 1;
        ghostPiece.y += 1;             //1 above the place it would colide with other minos/bounds
        return ghostPiece;
    }

    //this function can be split up
    moveCurrentPiece(amount)
    {
        if (this.#AREtimer > 0)
            return;

        const maxLeft = -leftToColision(this.#currentPiece, this.#board);
        const maxRight = rightToColision(this.#currentPiece, this.#board);
        amount = Math.max(maxLeft, Math.min(amount, maxRight))

        let newPiece = this.#currentPiece.copy();
        newPiece.move(amount, 0);
        if (!this.#board.doesColide(newPiece))
        {
            const oldX = this.#currentPiece.x;
            this.#currentPiece = newPiece;

            if (oldX != this.#currentPiece.x)
            {
                this.#lastMovementASuccessfulSpin = false;
                this.#resetLockDelay();
                this.callEvent("onPieceMove", 
                {
                    //positive is right, negitive is left
                    distance: this.#currentPiece.x - oldX
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
    #resetLockDelay()
    {
        if (this.currentPiece.lockTimer > 0)
        {
            this.currentPiece.lockTimer = 0;
            ++(this.currentPiece.lockResets);

            if (this.currentPiece.lockResets > this.rules.maxLockResets)
                this.#placeCurrentPiece();
        }
    }

    #placeCurrentPiece()
    {
        const spin = this.currentPiece.type === "T"
            ? this.#threeCornerSpinDetection()
            : this.#inmovableSpinDetection();
        this.#lockCurrentPiece();

        const linesClearedThisPiece = this.#board.completedLines.length
        this.#AREtimer = linesClearedThisPiece > 0 ? this.rules.lineARE : this.rules.ARE;

        this.callEvent("onPieceLock", {
            oldBoard: this.#board.copy(),
            clearedLines: linesClearedThisPiece,
            spinType: spin,
            piece: this.currentPiece.copy()
        })

        this.#board.clearLines(this.#board.completedLines)
        this.#spawnNextPiece();

        this.callEvent("onPiecePlace");
    }

    //only for t pieces
    #threeCornerSpinDetection()
    {
        if (this.#currentPiece.type !== "T")
            return SpinType.NONE;
        if (this.#lastMovementASuccessfulSpin !== true)
            return SpinType.NONE;

        const corners = getPieceCorners(this.#currentPiece.type, this.#currentPiece.rotation)
        if (corners === null)
            return SpinType.NONE;

        const centerX = this.#currentPiece.x;
        const centerY = this.#currentPiece.y;

        const cornerCount = (() =>
        {
            let count = 0
            for (const corner of corners.primary.concat(corners.secondary))
            {
                if (this.#board.doesColide(Point(centerX + corner.x, centerY +  corner.y)))
                    ++count
            }
            return count;
        })()
        if (cornerCount < 3)
            return SpinType.NONE;

        const coverdPrimaryCorners = corners.primary.every(corner => this.#board.doesColide(Point(centerX + corner.x, centerY +  corner.y)))
        const coverdSecondaryCorners = corners.secondary.some(corner => this.#board.doesColide(Point(centerX + corner.x, centerY +  corner.y)))

        if (!coverdPrimaryCorners)
            return SpinType.MINI;
        else if (coverdPrimaryCorners && coverdSecondaryCorners)
            return SpinType.FULL;
        return SpinType.NONE;
    }

    #inmovableSpinDetection()
    {
        let pieceUp = this.#currentPiece.copy();
        pieceUp.y += 1;

        let pieceLeft = this.#currentPiece.copy();
        pieceLeft.x -= 1;

        let pieceRight = this.#currentPiece.copy();
        pieceRight.x += 1;

        if (this.#board.doesColide(pieceUp) && this.#board.doesColide(pieceLeft) 
                && this.#board.doesColide(pieceRight))
            return SpinType.FULL;
        return SpinType.NONE;
    }

    /**
     * This function puts the piece on the playfield
     * 
     * @returns nothing
     */
    #lockCurrentPiece()
    {
        if (this.currentPiece === undefined)
        {
            console.error("cannot lock an undefined piece");
            return;
        }

        if (this.#board.doesColide(this.currentPiece))
        {
            console.warn("Could not lock the current piece onto the board");
            return;
        }

        //check for topout
        if (Math.min(...this.currentPiece.minos.map(element => element.y)) >= this.#board.height)
            this.endGame();

        let newBoard = this.#board.copy();
        for (let mino of this.#currentPiece.minos)
            newBoard.set(mino.x, mino.y, this.currentPiece.type);

        this.#board = newBoard;
        this.#holdUsed = false;             //refresh hold
    }

    /*
        spawns a new falling piece on the playfield and cancels the old one.
        if a type is specified then it spawns one of that type otherwise it
        gets the next that is next in the next queue.
     */
    #spawnNextPiece(type = null)
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
        if (this.#board.doesColide(newFallingPiece))
        {
            this.endGame();
            return;
        }

        this.#currentPiece = newFallingPiece;
        this.#topupNextQueue();
    }

    endGame()
    {
        this.stats.end = new Date();
        this.#alive = false;
    }

    #initStats()
    {
        return {
            start: new Date(),       //assuming the game starts as soon as the object is constructed
            perfectClears: 0,
            combo: 0,
            highestCombo: 0,
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

    #topupNextQueue()
    {
        if (this._nextQueue === undefined)
            this._nextQueue = [];
        while (this._nextQueue.length < 5)
            this._nextQueue.push(...this.rules.pieceGeneration(this))
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

    //     this.#placeCurrentPiece();
    // }
}

//this tracks types of lines cleared
eventManager.addEvent("onPieceLock", (e) => 
{
    const logicPlayer = e.player.logic;
    if (e.clearedLines > 0)
    {
        if (logicPlayer.stats.linesCleared[e.clearedLines] == undefined)
            logicPlayer.stats.linesCleared[e.clearedLines] = 0;
        ++(logicPlayer.stats.linesCleared[e.clearedLines])
    }

    const spin = e.spinType
    if (spin !== SpinType.NONE)
    {
        //TODO change 2 to spin
        if (logicPlayer.stats.spins[2][logicPlayer.currentPiece.type] == undefined)
            logicPlayer.stats.spins[2][logicPlayer.currentPiece.type] = {}
        if (logicPlayer.stats.spins[2][logicPlayer.currentPiece.type][e.clearedLines] == undefined)
            logicPlayer.stats.spins[2][logicPlayer.currentPiece.type][e.clearedLines] = 0
    
         ++(logicPlayer.stats.spins[2][logicPlayer.currentPiece.type][e.clearedLines])
    }

    if (e.clearedLines === 0)
        logicPlayer.stats.combo = 0;
    else
    {
        ++(logicPlayer.stats.combo);
        if (logicPlayer.stats.combo > logicPlayer.stats.highestCombo)
            logicPlayer.stats.highestCombo = logicPlayer.stats.combo
    }

    logicPlayer.stats.piecesPlaced += 1;
});

eventManager.addEvent("onPiecePlace", (e) => 
{
    const logicPlayer = e.player.logic;
    if (logicPlayer.board.isPc)
        ++(logicPlayer.stats.perfectClears)
});