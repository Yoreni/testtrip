const defaultDrawPieceValues = {
    transpancery: 1,
    size: 16,
    grayscale: false,
}

const showStats = ["PPS", "time", "pieces"]
const greyScaleFilter = new PIXI.ColorMatrixFilter();
greyScaleFilter.blackAndWhite();

class PlayerRenderer
{
    /**
     * @type {Object{string: function(Player) : string}}
     */
    static #FORMATTED_STATS = {
        "PPS": (player) => player.pps.toFixed(2),
        "time": (player) => mss000timeformat(player.time),
        "pieces": (player) => player.piecesPlaced,
        "lines": (player) => player.linesCleared,
    }

    constructor(logicPlayer, pixiContainer)
    {
        this._logicPlayer = logicPlayer;
        this.container = pixiContainer;
        this._objects = {}
        this.minoPool = new ObjectPool(logicPlayer.board.width * logicPlayer.board.height * 2);

        this._setupComponents();
    }

    update(delta)
    {
        if (this._logicPlayer.isAlive && this._logicPlayer.AREtimer === 0)
            this._drawFallingPiece();   //it is updated every frame because of gavity
        else
        {
            this._objects.fallingPiece.clear();
            this._objects.ghostPiece.clear();
        }
        this._updateStats();
    }

    _drawBoard(playField)
    {
        const iterations = playField.width * (playField.height + 10);
        for (let index = 0; index != iterations; ++index)
        {
            const x = index % playField.width;
            const y = Math.floor(index / playField.width);

            if (index >= this._objects.board.children.length)
            {
                let child = this.minoPool.borrow();
                child.position.set(x * 16, (y + 1) * -16)
                this._objects.board.addChild(child);

            }

            let child = this._objects.board.children[index];
            const minoType = playField.get(x, y);

            if (minoType === "0")
                child.visible = false;
            else
            {
                child.visible = true;
                const texture = currentSkin.getTexture(minoType);
                child.texture = texture;
                child.scale.set(16 / texture.width);
            }
        }
    }

    _drawPiece(piece, graphics , x, y, settings = {})
    {
        settings = saveOptionsWithDeafults(settings, defaultDrawPieceValues);
        graphics.clear()
        graphics.beginFill(pieceColours[piece.type], settings.transpancery);
        for (let mino of piece.minos)
            // * -16 for y coordinate because of how y works in PIXI.js
        {
            const drawX = ((mino.x - piece.x) * 16) + x;
            const drawY = ((mino.y - piece.y) * -16) + y;
            graphics.drawRect(drawX, drawY, 16, 16)
        }
        graphics.endFill();
    }

    _drawFallingPiece()
    {
        const piece = this._logicPlayer.currentPiece;
        if (piece === undefined)
            return;

        this._objects.fallingPiece.updatePiece(piece);
        this._objects.fallingPiece.position.set((piece.x + 0) * 16, (piece.y + 1) * -16)
    }

    _drawGhostPiece()
    {
        const piece = this._logicPlayer.ghostPiece
        this._objects.ghostPiece.updatePiece(piece);
        this._objects.ghostPiece.position.set((piece.x + 0) * 16, (piece.y + 1) * -16)
    }

    _drawNextQueue()
    {
        this._objects.nextQueue.position.set(16 * (this._logicPlayer.board.width + 3), 
                                            -16 * this._logicPlayer.board.height)

        for (let [index, child] of this._objects.nextQueue.children.entries())
        {
            const pieceType = this._logicPlayer.nextQueue[index];
            if (pieceType !== undefined)
            {
                const piece = new FallingPiece(pieceType);
                child.updatePiece(piece);
            }
        }
    }

    _drawHoldPiece()
    {
        if (this._logicPlayer.holdPiece === null)
        {
            this._objects.holdPiece.visible = false;
            return;
        }

        this._objects.holdPiece.updatePiece(new FallingPiece(this._logicPlayer.holdPiece))
        this._objects.holdPiece.visible = true;
        if (this._logicPlayer.holdUsed)
            this._objects.holdPiece.filters = [greyScaleFilter]
        else
            this._objects.holdPiece.filters = []
    }

    _updateStats(statsToDisplay = showStats)
    {
        while (this._objects.statsDisplay.children.length < statsToDisplay.length)
             this._objects.statsDisplay.addChild(new InfoText(this))

        for (let [index, child] of this._objects.statsDisplay.children.entries())
        {
            //move this block into its own function
            if (child.stat === "")
                child.stat = statsToDisplay[index]//langManager.get(`gameHud.${statsToDisplay[index]}`)

            child.update();
            child.y = index * -50
        }
    }

    _setupComponents()
    {
        let playField = new PIXI.Container();
        this.playField = playField

        //add a background to the board
        let boardBackground = new PIXI.Graphics();
        boardBackground.beginFill(0x000000);
        boardBackground.drawRect(0, this._logicPlayer.board.height * -16, 
        this._logicPlayer.board.width * 16, this._logicPlayer.board.height * 16);
        boardBackground.endFill();
        this._objects.boardBackground = boardBackground;
        playField.addChild(boardBackground);

        this._objects.board = new PIXI.Container();
        playField.addChild(this._objects.board);

        this._objects.fallingPiece = new RenderedPiece(this._logicPlayer.currentPiece);
        playField.addChild(this._objects.fallingPiece);

        this._objects.ghostPiece = new RenderedPiece(null);
        this._objects.ghostPiece.alpha = 0.3;
        playField.addChild(this._objects.ghostPiece);

        this._objects.nextQueue = new PIXI.Container();
        playField.addChild(this._objects.nextQueue);
        for (let idx= 0; idx != 5; ++idx)
        {
            let piece = new RenderedPiece(this._logicPlayer.nextQueue[idx]);
            piece.y = idx * 16 * 3;
            this._objects.nextQueue.addChild(piece);
        }

        this._objects.holdPiece = new RenderedPiece(null);
        this._objects.holdPiece.position.set((2 * -16), (this._logicPlayer.board.height) * -16)
        playField.addChild(this._objects.holdPiece);
    
        this._objects.statsDisplay = new PIXI.Container();
        this._objects.statsDisplay.position.set(-10, -20);
        playField.addChild(this._objects.statsDisplay);

        this.container.addChild(playField);
        //this.container.pivot.set(this.container.width * 0.5, this.container.height * -0.5);
        //this.container.pivot.set(this.container.width * 0.5, this.container.height * -0.5);
        //this.container.pivot.set(this.container.x * -1, this.container.y * -1);
        //this.container.pivot.set(500, 500)

        //draw the board just in case the player can see the board is its not an empty board
        this._drawBoard(this._logicPlayer.board);
        this._drawFallingPiece();
        this._drawGhostPiece();
        this._drawNextQueue();
    }

    destory()
    {
        this._objects.holdPiece.destroy();
        this._objects.ghostPiece.destroy();
        this._objects.fallingPiece.destroy();
        for (const nextPiece of this._objects.nextQueue.children)
            nextPiece.destroy();

        this.container.visible = false;
        this.container.removeChildren();
        //this.container.destory();
    }

    static addEvents()
    {
        eventManager.addEvent("onPieceLock", (e) =>
        {
            const render = e.player.render;
            let board = e.oldBoard;
            render._drawBoard(board);
            render._drawHoldPiece();
        })

        eventManager.addEvent("AREend", (e) =>
        {
            const render = e.player.render;
            render._drawBoard(e.player.board);
            render._drawGhostPiece();
        })

        eventManager.addEvent("onPiecePlace", (e) =>
        {
            const render = e.player.render;
            render._drawFallingPiece();
            render._drawGhostPiece();
            render._drawNextQueue();

            if (e.player.logic.AREtimer === 0)
                render._drawBoard(e.player.logic.board);
        })

        eventManager.addEvent("onHold", (e) =>
        {
            const render = e.player.render;
            render._drawHoldPiece();
            render._drawFallingPiece();
            render._drawGhostPiece();
            render._drawNextQueue();
        })

        eventManager.addEvent("onPieceRotate", (e) =>
        {
            const render = e.player.render;
            render._drawFallingPiece();
            render._drawGhostPiece();
        })

        eventManager.addEvent("onSoftDrop", (e) =>
        {
            const render = e.player.render;
            render._drawFallingPiece();
        })

        eventManager.addEvent("onPieceMove", (e) =>
        {
            const render = e.player.render;
            render._drawFallingPiece();
            render._drawGhostPiece();
        })
    }

    /**
     * 
     * gets a human readble format of a stat releated to a player
     * 
     * @param {string} statName 
     */
    getPlayerStat(statName)
    {
        const func = PlayerRenderer.#FORMATTED_STATS[statName];
        return func(this._logicPlayer) ?? "undefined";
    }

    static addStat(statName, func)
    {
        PlayerRenderer.#FORMATTED_STATS[statName] = func;
    }
}

class InfoText extends PIXI.Container
{
    #stat;
    #render;

    constructor(render, stat = "")
    {
        super();
        this.nameText = new PIXI.Text("", textStyle());
        this.numberText = new PIXI.Text("", textStyle());
        this.nameText.y -= 20
        this.nameText.anchor.set(1, 0)
        this.numberText.anchor.set(1, 0)
        this.addChild(this.nameText);
        this.addChild(this.numberText);
        this.stat = stat;
        this.#render = render;
    }

    get stat()
    {
        return this.#stat
    }

    set stat(stat)
    {
        this.#stat = stat
        this.nameText.text = langManager.get(`gameHud.stats.${this.#stat}`);
    }

    update(text)
    {
        let display = this.#render.getPlayerStat(this.stat);
        this.numberText.text = display;
    }
}