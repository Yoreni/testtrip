const handling = {
    DAS: 6,
    SDF: 1.79e308,
    ARR: 1,
}

const showStats = ["PPS", "Time", "Pieces"]

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
        this._player = new Player();
        this._playerRender = new PlayerRenderer(this._player, this.container);
    }

    start()
    {
        
    }

    stop()
    {

    }

    update(delta)
    {
        this._player.tick(delta)

        if (this._player.isAlive && this._player.AREtimer === 0)
            this._handleKeyboard()

        this._playerRender.update(delta)
    }

    destory()
    {

    }

    init()
    {
        //add rasei
        this._objects.rasei = PIXI.Sprite.from("assets/rasei.png");
        this._objects.rasei.scale.set(0.4);
        this._objects.rasei.position.set(0, canvasSize.height - this._objects.rasei.height);
        this.container.addChild(this._objects.rasei);
    }

    _handleKeyboard() 
    {
        if (this._keybaord.left.isDown)
        {
            if (this._keybaord.left.framesDown === 1)
                this._player.moveCurrentPiece(-1);
            else if (this._keybaord.left.framesDown > handling.DAS)
                this._player.moveCurrentPiece(-1 / handling.ARR);
        }
        else if (this._keybaord.right.isDown)
        {
            if (this._keybaord.right.framesDown === 1)
                this._player.moveCurrentPiece(1);
            else if (this._keybaord.right.framesDown > handling.DAS)
                this._player.moveCurrentPiece(1 / handling.ARR);
        }

        if (this._keybaord.hardDrop.framesDown === 1)
            this._player.harddrop();
        if (this._keybaord.softDrop.framesDown > 0)
            this._player.softDrop();
        if (this._keybaord.rotateClockwise.framesDown === 1)
            this._player.rotateClockwise();
        if (this._keybaord.rotateAnticlockwise.framesDown === 1)
            this._player.rotateAnticlockwise();
        if (this._keybaord.rotate180.framesDown === 1)
            this._player.rotate180();
        if (this._keybaord.hold.framesDown === 1)
            this._player.hold();
    }
}