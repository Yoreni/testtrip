class Game extends IScene
{
    constructor()
    {
        super();
        this.container = new PIXI.Container();
        this._objects = {};

        this.mode = modeManager.get("cheeseRace");
        this.mode.events();
        addonMangaer.applyAddons(this.mode);

        this._players = [];
        //penominos ["S5", "Z5", "P", "Q", "F", "E", "T5", "U", "V", "W", "X","J5","L5", "R", "Y", "N", "H", "I5"]
        this._addPlayer();
        PlayerRenderer.addEvents();

        if (this.mode.init !== undefined)
            this.mode.init(this.mode.gameRules ?? Player.defaultRules);
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
            player.input.inputs();

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
            render: new Renderer(player, playerPixiContainer),
            input: new Keyboard(player)
        });
    }

    callEvent(eventName, id, data = {})
    {
        data.player = this._players[id].logic;
        data.render = this._players[id].render;
        eventManager.callEvent(eventName, data);
    }
}