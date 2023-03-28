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
        this._board = new Board();
    }

    start()
    {
        
    }

    stop()
    {

    }

    update()
    {
        this._objects.debugText.text = this._keybaord.hardDrop.getSecondsDown()

        this._handleKeyboard()

        this._drawBoard();
        this._drawFallingPiece();
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
        playField.position.set(500, 200);

        this._objects.board = new PIXI.Graphics();
        playField.addChild(this._objects.board);

        this._objects.fallingPiece = new PIXI.Graphics();
        playField.addChild(this._objects.fallingPiece);

        this.container.addChild(playField);

    }

    _drawBoard()
    {
        this._objects.board.clear();

        for (let x = 0; x != 10; ++x)
        {
            for (let y = 0; y != 20; ++y)
            {
                const minoType = this._board.getMinoOnBoard(x, y);
                const colour = minoType === "0" ? 0x111111 : pieceColours[minoType];
                this._objects.board.beginFill(colour);
                this._objects.board.drawRect(x * 16, y * 16, 16, 16);
                this._objects.board.endFill();
            }
        }
    }

    _drawFallingPiece()
    {
        this._objects.fallingPiece.clear()
        const piece = this._board.currentPiece;
        this._objects.fallingPiece.beginFill(pieceColours[piece.type]);
        for (let mino of piece.minos)
            this._objects.fallingPiece.drawRect(mino.x * 16, mino.y * 16, 16, 16)
        this._objects.fallingPiece.endFill();
    }

    _handleKeyboard()
    {
        if (this._keybaord.left.framesDown === 1)
            this._board.movePieceLeft();
        else if (this._keybaord.right.framesDown === 1)
            this._board.movePieceRight();
    }
}