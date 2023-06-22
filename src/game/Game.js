const handling = {
    DAS: 6,
    SDF: 1.79e308,
    ARR: 1,
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

        this.mode = modeManager.get("sprint");
        this.mode.events();
        addonMangaer.applyAddons(this.mode);

        this._players = [];
        //penominos ["S5", "Z5", "P", "Q", "F", "E", "T5", "U", "V", "W", "X","J5","L5", "R", "Y", "N", "H", "I5"]
        this._addPlayer();
        PlayerRenderer.addEvents();
    }

    start()
    {
        
    }

    stop()
    {

    }

    update(delta)
    {
        let player = this._players[0];
        player.logic.tick(delta)

        if (player.logic.isAlive && player.logic.AREtimer === 0)
            this._handleKeyboard()

        player.render.update(delta)
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

    _addPlayer()
    {
        const Renderer = this.mode.render ?? PlayerRenderer;
        const Logic = this.mode.logic ?? Player;

        let player =  new Logic(this.mode.gameRules ?? {}, this._players.length);
        player.callEvent = (eventName, data = {}) => this.callEvent(eventName, player.id, data);

        let playerPixiContainer = new PIXI.Container
        this.container.addChild(playerPixiContainer)

        this._players.push(
        {
            logic: player,
            render: new Renderer(player, playerPixiContainer)
        });
    }

    callEvent(eventName, id, data = {})
    {
        data.player = this._players[id].logic;
        data.render = this._players[id].render;
        eventManager.callEvent(eventName, data);
    }

    _handleKeyboard() 
    {
        let player = this._players[0].logic;
        let keyboard = this._keybaord;

        function dasRight()
        {
            if (keyboard.right.framesDown === 1)
                player.moveCurrentPiece(1);
            else if (keyboard.right.framesDown > handling.DAS)
                player.moveCurrentPiece(1 / handling.ARR);
        }

        function dasLeft()
        {
            if (keyboard.left.framesDown === 1)
                player.moveCurrentPiece(-1);
            else if (keyboard.left.framesDown > handling.DAS)
                player.moveCurrentPiece(-1 / handling.ARR);
        }

        if (this._keybaord.hardDrop.framesDown === 1)
            player.harddrop();
        if (this._keybaord.left.framesDown > this._keybaord.right.framesDown)
        {
            if (this._keybaord.right.framesDown === 0)
                dasLeft();
            else
                dasRight();
        }
        else if (this._keybaord.right.framesDown > this._keybaord.left.framesDown)
        {
            if (this._keybaord.left.framesDown === 0)
                dasRight();
            else
                dasLeft()
        }
        else
            dasLeft();
        if (this._keybaord.softDrop.framesDown > 0)
            player.softDrop();
        if (this._keybaord.rotateClockwise.framesDown === 1)
            player.rotateClockwise();
        if (this._keybaord.rotateAnticlockwise.framesDown === 1)
            player.rotateAnticlockwise();
        if (this._keybaord.rotate180.framesDown === 1)
            player.rotate180();
        if (this._keybaord.hold.framesDown === 1)
            player.hold();
    }
}