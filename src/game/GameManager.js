class GameManager
{
    #mode;
    #players;
    #container;
    #playerSubContainers;

    constructor(container)
    {
        this.#players = [];
        this.#container = container;
    }

    get mode()
    {
        return this.#mode;
    }

    get players()
    {
        return this.#players;
    }

    load(modeName)
    {
        this.#mode = modeName;
        this.#mode = modeManager.get(modeName);
        this.modeEventIds = this.#mode.events();
        addonMangaer.applyAddons(this.#mode);

        if (this.#mode.init !== undefined)
            this.#mode.init(this.#mode.gameRules ?? Player.defaultRules);

        this.#playerSubContainers = [];
    }

    start()
    {
        if (this.#mode === null || this.#mode === undefined)
            throw "No mode set";

        this.#players = [];
        this._addPlayer();
        console.log(eventManager._events)
    }

    unload()
    {
        for (let player of this.#players)
        {
            player.render.destory();
        }
        eventManager.removeEvent(...this.modeEventIds)
        this.#container.removeChild(this.#playerSubContainers[0]);

        this.#mode = null;
    }

    _addPlayer()
    {
        const Renderer = this.#mode.render ?? PlayerRenderer;
        const Logic = this.#mode.logic ?? Player;

        let player =  new Logic(this.#mode.gameRules ?? {}, this.#players.length);
        player.callEvent = (eventName, data = {}) => this.callEvent(eventName, player.id, data);

        let playerPixiContainer = new PIXI.Container
        this.#container.addChild(playerPixiContainer)
        this.#playerSubContainers.push(playerPixiContainer);

        this.#players.push(
        {
            logic: player,
            render: new Renderer(player, playerPixiContainer),
            input: new Keyboard(player)
        });
    }

    callEvent(eventName, id, data = {})
    {
        data.player = this.#players[id].logic;
        data.render = this.#players[id].render;
        eventManager.callEvent(eventName, data);
    }
}