const defaultDrawPieceValues = {
    transpancery: 1,
    size: 16,
    grayscale: false,
}

const showStats = ["PPS", "Time", "Pieces"]


class PlayerRenderer
{
    constructor(logicPlayer, pixiContainer)
    {
        this._logicPlayer = logicPlayer;
        this.container = pixiContainer;
        this._objects = {}
        this.minoPool = new ObjectPool(logicPlayer.board.width * logicPlayer.board.height * 2);
        //this.InfoDisplay = InfoText;

        this._setupComponents();
    }

    update(delta)
    {
        if (this._logicPlayer.isAlive && this._logicPlayer.AREtimer === 0)
        {
            this._drawFallingPiece();
            this._drawGhostPiece();
        }
        else
        {
            this._objects.fallingPiece.clear();
            this._objects.ghostPiece.clear();
        }
        this._drawNextQueue();
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
                const texture = currentSkin === null 
                    ? PIXI.Texture.from(`assets/${minoType}.png`) 
                    : currentSkin.getTexture(minoType);
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
            const piece = new FallingPiece(this._logicPlayer.nextQueue[index])
            child.updatePiece(piece);
            //this._drawPiece(piece, child, 0, index * 16 * 3);
        }
    }

    _drawHoldPiece()
    {
        const pieceType = this._logicPlayer.holdPiece;
        if(pieceType == null)
            return;

        this._drawPiece(new FallingPiece(pieceType), this._objects.holdPiece,
            2 * -16, (this._logicPlayer.board.height - 1) * -16, 1);
    }

    _updateStats(statsToDisplay = showStats)
    {
        for (let [index, child] of this._objects.statsDisplay.children.entries())
        {
            //move this block into its own function
            if (child.stat === "")
                child.stat = statsToDisplay[index];

            child.update();
            child.y = index * -50
        }
    }

    _setupComponents()
    {
        let playField = new PIXI.Container();
        this.container.position.set(500, 500);

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
        for (let idx= 0; idx != 3; ++idx)
            this._objects.statsDisplay.addChild(new InfoText(this))

        this.container.addChild(playField);
        //this.container.pivot.set(this.container.width * 0.5, this.container.height * -0.5);
        //this.container.pivot.set(this.container.width * 0.5, this.container.height * -0.5);
        //this.container.pivot.set(this.container.x * -1, this.container.y * -1);
        //this.container.pivot.set(500, 500)
    }

    static addEvents()
    {
        eventManager.addEvent("onPieceLock", (e) =>
        {
            let board = e.oldBoard;
            for (let lineNumber of board.completedLines)
            {
                for (let index = 0; index != board.width; ++index)
                {
                    board.set(index, lineNumber, "0")
                }
            }
            e.render._drawBoard(board);
        })

        eventManager.addEvent("AREend", (e) =>
        {
            e.render._drawBoard(e.player.board);
        })

        eventManager.addEvent("onPiecePlace", (e) =>
        {
            if (e.player.AREtimer === 0)
                e.render._drawBoard(e.player.board);
        })

        eventManager.addEvent("onHold", (e) =>
        {
            e.render._objects.holdPiece.updatePiece(new FallingPiece(e.player.holdPiece))
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
        if (statName === "PPS")
            return (this._logicPlayer.piecesPlaced / this._logicPlayer.time).toFixed(2);
        if (statName === "Time")
            return mss000timeformat(this._logicPlayer.time);
        if (statName === "Pieces")
            return this._logicPlayer.piecesPlaced;
        return "undefined";
    }
}

class InfoText extends PIXI.Container
{
    #stat;
    #player;
    #render;

    constructor(render, stat = "")
    {
        super();
        this.nameText = new PIXI.Text("", {fontSize: 24, fontWeight: "bold", fontFamily: "Calibri", "align": "right",});
        this.numberText = new PIXI.Text("", {fontSize: 24, fontWeight: "bold", fontFamily: "Calibri", "align": "right",});
        this.nameText.y -= 20
        this.nameText.anchor.set(1, 0)
        this.numberText.anchor.set(1, 0)
        this.addChild(this.nameText);
        this.addChild(this.numberText);
        this.stat = stat;
        this.#player = render._logicPlayer;
        this.#render = render;
    }

    get stat()
    {
        return this.#stat
    }

    set stat(stat)
    {
        this.#stat = stat
        this.nameText.text = this.#stat;
    }

    update(text)
    {
        let display = this.#render.getPlayerStat(this.stat);
        this.numberText.text = display;
    }
}