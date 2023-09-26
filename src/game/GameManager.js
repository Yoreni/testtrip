const boardPositons = {
    1: [Point(500, 500)],
    2: [Point(300, 500), Point(700, 500)]
}

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
        this.modeEventIds = [];
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
        if (typeof(this.#mode.events) === "function")
            this.modeEventIds = this.#mode.events();
        else
        {
            for (const [trigger, func] of Object.entries(this.#mode.events))
            {
                const eventId = eventManager.addEvent(trigger, func)
                this.modeEventIds.push(eventId)
            }
        }
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
        this.numOfPlayers = 2;
        for (let index = 0; index != this.numOfPlayers; ++index)
            this._addPlayer();

        this.#callOnGameStartEventForEachPlayer();
    }

    restartGame()
    {
        const Logic = this.#mode.logic ?? Player;
        for (const player of this.#players)
        {
            //reset the player to a new game
            player.logic = new Logic(this.#mode.gameRules ?? {}, player.logic.id);
            player.logic.callEvent = (eventName, data = {}) => this.callEvent(eventName, player.logic.id, data);

            //inform the render and input about the new player object
            player.render._logicPlayer = player.logic;
            player.input = new Keyboard(player.logic);

            //redraw some stuff so it shows that the game restarted
            player.render._drawBoard(player.logic.board);
            player.render._drawHoldPiece();
            player.render._drawNextQueue();
            player.render._drawGhostPiece();
            player.render._drawFallingPiece();
        }

        this.#callOnGameStartEventForEachPlayer();
    }

    #callOnGameStartEventForEachPlayer()
    {
        for (const player of this.#players)
        {
            eventManager.callEvent("onGameStart", {
                player: player.logic,
                render: player.render,
                players: this.players,//this.players.filter((player2) => player.logic.id === player2.logic.id)
            })
        }
    }

    unload()
    {
        for (let player of this.#players)
            player.render.destory();
        
        eventManager.removeEvent(...this.modeEventIds)  //TODO this line can be handled by ModeManger
        addonMangaer.removeAllAddons();  //TODO this line can be handled by ModeManger
        for (const playerContainer of this.#playerSubContainers)
            this.#container.removeChild(playerContainer);

        this.#mode = null;
        this.modeEventIds = [];
    }

    _addPlayer()
    {
        const Renderer = this.#mode.render ?? PlayerRenderer;
        const Logic = this.#mode.logic ?? Player;

        let player =  new Logic(this.#mode.gameRules ?? {}, this.#players.length);
        player.callEvent = (eventName, data = {}) => this.callEvent(eventName, player.id, data);

        let playerPixiContainer = new PIXI.Container()
        const position = boardPositons[this.numOfPlayers][player.id];
        playerPixiContainer.position.set(position.x, position.y);
        this.#container.addChild(playerPixiContainer)
        this.#playerSubContainers.push(playerPixiContainer);

        this.#players.push(
        {
            logic: player,
            render: new Renderer(player, playerPixiContainer),
            input: player.id === 1 ? new Keyboard(player) : new NoInput(),
        });
    }

    callEvent(eventName, id, data = {})
    {
        data.player = this.#players[id].logic;
        data.render = this.#players[id].render;
        eventManager.callEvent(eventName, data);
    }
}