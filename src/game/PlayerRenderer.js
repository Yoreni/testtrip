const defaultDrawPieceValues = {
    transpancery: 1,
    size: 16,
    grayscale: false,
}

class PlayerRenderer
{
    constructor(logicPlayer, pixiContainer)
    {
        this._logicPlayer = logicPlayer;
        this.container = pixiContainer;
        this._objects = {}

        this._setupComponents();
        this._bindEvents();
    }

    update(delta)
    {
        this._objects.text.text = this._logicPlayer.combo;

        // if (this._logicPlayer.AREtimer === 0)
        // {
               this._drawBoard(this._logicPlayer.board);
        //     this._lastBoard = this._logicPlayer.board;
        // }
        // else
        // {
        //     for (let mino of this._logicPlayer.currentPiece.minos)
        //         this._lastBoard.set(mino.x, mino.y, this._logicPlayer.currentPiece.type);
        //     this._drawBoard(this._lastBoard);
        //}

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
        this._drawHoldPiece();
    }

    _drawBoard(playField)
    {
        this._objects.board.clear();

        for (let x = 0; x != playField.width; ++x)
        {
            for (let y = 0; y != playField.height + 10; ++y)
            {
                const minoType = playField.get(x, y);
                
                                            //dont draw the background above the playfield
                if (minoType === "0" && y >= playField.height)   
                    continue;

                const colour = minoType === "0" ? 0x111111 : pieceColours[minoType];
                this._objects.board.beginFill(colour);
                this._objects.board.drawRect(x * 16, y * -16, 16, 16);
                this._objects.board.endFill();
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
        this._drawPiece(piece, this._objects.fallingPiece, piece.x * 16, piece.y * -16)
    }

    _drawGhostPiece()
    {
        const piece = this._logicPlayer.ghostPiece
        this._drawPiece(piece, this._objects.ghostPiece, piece.x * 16, piece.y * -16,
            {
                transpancery: 0.3
            })
    }

    _drawNextQueue()
    {
        this._objects.nextQueue.position.set(16 * (this._logicPlayer.board.width + 3), 
                                            -16 * (this._logicPlayer.board.height - 1))
        for (let [index, child] of this._objects.nextQueue.children.entries())
        {
            const piece = new FallingPiece(this._logicPlayer.nextQueue[index])
            this._drawPiece(piece, child, 0, index * 16 * 3);
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

    _setupComponents()
    {
        let playField = new PIXI.Container();
        playField.position.set(500, 500);

        this._objects.board = new PIXI.Graphics();
        playField.addChild(this._objects.board);

        this._objects.fallingPiece = new PIXI.Graphics();
        playField.addChild(this._objects.fallingPiece);

        this._objects.ghostPiece = new PIXI.Graphics();
        playField.addChild(this._objects.ghostPiece);

        this._objects.nextQueue = new PIXI.Container();
        playField.addChild(this._objects.nextQueue);
        for (let idx= 0; idx != 5; ++idx)
            this._objects.nextQueue.addChild(new PIXI.Graphics())

        this._objects.holdPiece = new PIXI.Graphics();
        playField.addChild(this._objects.holdPiece);
    

        this.container.addChild(playField);

        this._objects.text = new PIXI.Text("", {fontSize: 24,fontWeight: "bold",fontFamily: "Calibri"});
        this._objects.text.position.set(10, 70);
        this.container.addChild(this._objects.text);
    }

    _bindEvents()
    {
        eventManager.addEvent("onPiecePlace", (e) =>
        {
            console.log("s");
        })
    }
}