const handling = {
    DAS: 6,
    SDF: 1.79e308,
    ARR: 1,
}

const defaultDrawPieceValues = {
    transpancery: 1,
    size: 16,
    grayscale: false,
}

class Game extends IScene
{
    constructor()
    {
        super();
        this.container = new PIXI.Container();
        this._objects = {};
        this._keybaord = {
            left: new KeyDetector(app, "ArrowLeft"),
            right: new KeyDetector(app, "ArrowRight"),
            softDrop: new KeyDetector(app, "ArrowDown"),
            rotateClockwise: new KeyDetector(app, "ArrowUp"),
            rotateAnticlockwise: new KeyDetector(app, "z"),
            hold: new KeyDetector(app, "x"),
            rotate180: new KeyDetector(app, "c"),
            hardDrop: new KeyDetector(app, " "),
        }
        this._board = new Player();
    }

    start()
    {
        
    }

    stop()
    {

    }

    update(delta)
    {
        this._objects.debugText.text = this._keybaord.hardDrop.getSecondsDown()
        this._board.tick(delta)

        if (this._board.isAlive && this._board.AREtimer === 0)
            this._handleKeyboard()

        this._drawBoard();
        if (this._board.isAlive && this._board.AREtimer === 0)
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

    destory()
    {

    }

    init()
    {
        this._objects.debugText = new PIXI.Text("", {fontSize: 24,fontWeight: "bold",fontFamily: "Calibri"});
        this._objects.debugText.position.set(10, 50);
        this.container.addChild(this._objects.debugText);

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
        this._objects.nextQueue.position.set(16 * 13, -16 * 19);
        for (let idx= 0; idx != 5; ++idx)
            this._objects.nextQueue.addChild(new PIXI.Graphics())

        this._objects.holdPiece = new PIXI.Graphics();
        playField.addChild(this._objects.holdPiece);
    

        this.container.addChild(playField);

        //add rasei
        this._objects.rasei = PIXI.Sprite.from("assets/rasei.png");
        this._objects.rasei.scale.set(0.4);
        this._objects.rasei.position.set(0, canvasSize.height - this._objects.rasei.height);
        this.container.addChild(this._objects.rasei);
    }

    _drawBoard()
    {
        this._objects.board.clear();

        for (let x = 0; x != 10; ++x)
        {
            for (let y = 0; y != 30; ++y)
            {
                const minoType = this._board.getMinoOnBoard(x, y);

                if (minoType === "0" && y >= 20)    //dont draw the background above the playfield
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
        const piece = this._board.currentPiece;
        this._drawPiece(piece, this._objects.fallingPiece, piece.x * 16, piece.y * -16)
    }

    _drawGhostPiece()
    {
        const piece = this._board.ghostPiece
        this._drawPiece(piece, this._objects.ghostPiece, piece.x * 16, piece.y * -16,
            {
                transpancery: 0.3
            })
    }

    _drawNextQueue()
    {
        for (let [index, child] of this._objects.nextQueue.children.entries())
        {
            const piece = new FallingPiece(this._board.nextQueue[index])
            this._drawPiece(piece, child, 0, index * 16 * 3);
        }
    }

    _drawHoldPiece()
    {
        const pieceType = this._board.holdPiece;
        if(pieceType == null)
            return;

        this._drawPiece(new FallingPiece(pieceType), this._objects.holdPiece,
            2 * -16, (this._board.board.height - 1) * -16, 1);
    }

    _handleKeyboard() 
    {
        if (this._keybaord.left.isDown)
        {
            if (this._keybaord.left.framesDown === 1)
                this._board.moveCurrentPiece(-1);
            else if (this._keybaord.left.framesDown > handling.DAS)
                this._board.moveCurrentPiece(-1 / handling.ARR);
        }
        else if (this._keybaord.right.isDown)
        {
            if (this._keybaord.right.framesDown === 1)
                this._board.moveCurrentPiece(1);
            else if (this._keybaord.right.framesDown > handling.DAS)
                this._board.moveCurrentPiece(1 / handling.ARR);
        }

        if (this._keybaord.hardDrop.framesDown === 1)
            this._board.harddrop();
        if (this._keybaord.softDrop.framesDown > 0)
            this._board.softDrop();
        if (this._keybaord.rotateClockwise.framesDown === 1)
            this._board.rotateClockwise();
        if (this._keybaord.rotateAnticlockwise.framesDown === 1)
            this._board.rotateAnticlockwise();
        if (this._keybaord.rotate180.framesDown === 1)
            this._board.rotate180();
        if (this._keybaord.hold.framesDown === 1)
            this._board.hold();
    }
}