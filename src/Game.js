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
        if (new Date().getTime() % 10 === 0)
            this._board.board[randInt(0, 19)][ randInt(0, 9)] = "Z";

        this._drawBoard();
    }

    destory()
    {

    }

    init()
    {
        this._objects.debugText = new PIXI.Text("", {fontSize: 24,fontWeight: "bold",fontFamily: "Calibri"});
        this._objects.debugText.position.set(10, 50);
        this.container.addChild(this._objects.debugText);

        this._objects.board = new PIXI.Graphics();
        this._objects.board.position.set(500, 200);
        this.container.addChild(this._objects.board);

    }

    _drawBoard()
    {
        this._objects.board.clear();

        for (let x = 0; x != 10; ++x)
        {
            for (let y = 0; y != 20; ++y)
            {
                const colour = this._board.getMinoOnBoard(x, y) === "0" ? 0x111111 : 0xFF0000;
                this._objects.board.beginFill(colour);
                this._objects.board.drawRect(x * 16, y * 16, 16, 16);
                this._objects.board.endFill();
            }
        }
    }
}