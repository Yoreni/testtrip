const handling = {
    DAS: 100,
    SDF: 1.79e308,
    ARR: 16,
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
            //             left: new KeyDetector(app, "a"),
            // right: new KeyDetector(app, "d"),
            // softDrop: new KeyDetector(app, "s"),
            // rotateClockwise: new KeyDetector(app, "l"),
            // rotateAnticlockwise: new KeyDetector(app, "k"),
            // hold: new KeyDetector(app, "Shift"),
            // rotate180: new KeyDetector(app, ";"),
            // hardDrop: new KeyDetector(app, "w"),
        }

        this.mode = modeManager.get("sprint");
        this.mode.events();
        addonMangaer.applyAddons(this.mode);

        this._players = [];
        //penominos ["S5", "Z5", "P", "Q", "F", "E", "T5", "U", "V", "W", "X","J5","L5", "R", "Y", "N", "H", "I5"]
        this._addPlayer();
        PlayerRenderer.addEvents();

        if (this.mode.init !== undefined)
            this.mode.init(this.mode.gameRules ?? Player.defaultRules);

        const handlingCode = (dir) =>
        {
            let player = this._players[0].logic;
            let render = this._players[0].render;

            //-1 is left, 1 is right
            player.moveCurrentPiece(dir);
            render._drawFallingPiece();
            render._drawGhostPiece();
            const key = dir === 1 ? this._keybaord.right : this._keybaord.left
            const otherKey = dir !== 1 ? this._keybaord.right : this._keybaord.left

            setTimeout(() =>
            {
                //check if you are still holding the key
                if (Math.round(key.getSecondsDown() * 1000) < handling.DAS)
                    return;

                const loop = setInterval(() => 
                {
                    const tapback = otherKey.getSecondsDown() > 0 
                            && key.getSecondsDown() > otherKey.getSecondsDown()
                    if (tapback)
                        return;

                    if (key.getSecondsDown() > 0)
                    {
                        player.moveCurrentPiece(dir);
                        render._drawFallingPiece();
                        render._drawGhostPiece();
                    }
                    else
                        clearInterval(loop);
                }, handling.ARR)
            }, handling.DAS)

        }
        this._keybaord.left.onDown = () => handlingCode(-1)
        this._keybaord.right.onDown = () => handlingCode(1)
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

        if (this._keybaord.hardDrop.framesDown === 1)
            player.harddrop();
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