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
            this.#mode.init(this.#mode.gameRules ?? PlayerLogic.defaultRules);

        this.#playerSubContainers = [];
    }

    start()
    {
        if (this.#mode === null || this.#mode === undefined)
            throw "No mode set";

        this.#players = [];
        this.numOfPlayers = this.#mode.name === "versus" ? 2 : 1; //lazy xD
        for (let index = 0; index != this.numOfPlayers; ++index)
            this._addPlayer();

        this.#callOnGameStartEventForEachPlayer();
    }

    restartGame()
    {
        const Logic = this.#mode.logic ?? PlayerLogic;
        for (const player of this.#players)
        {
            //reset the player to a new game
            player.logic = new Logic(this.#mode.gameRules ?? {}, player.logic.id);
            player.logic.callEvent = (eventName, data = {}) => this.callEvent(eventName, player.logic.id, data);

            //inform the render and input about the new player object
            player.render._logicPlayer = player.logic;
            player.input.logic = player.logic;

            //redraw some stuff so it shows that the game restarted
            player.render._drawBoard(player.logic.board);
            player.render._drawNextQueue();
            player.render._drawGhostPiece();
            player.render._drawFallingPiece();
            player.render._drawHoldPiece();
        }

        this.#callOnGameStartEventForEachPlayer();
    }

    #callOnGameStartEventForEachPlayer()
    {
        for (const player of this.#players)
        {
            eventManager.callEvent("onGameStart", {
                player,
                players: this.players,
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
        const Logic = this.#mode.logic ?? PlayerLogic;

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
            input: player.id === 0 ? new Keyboard(player) : new Keyboard(player),
        });

        if (player.id === 0)
        {
            const misamino = new TBotProtocol(player, "src/utils/bots/misaImport.js")
        }
    }

    hasEnded()
    {
        const alivePlayers = countOccrences(this.players.map((player) => player.logic.isAlive), true);
        const defaultCheck = (alivePlayers) => alivePlayers === 0;

        const check =  this.#mode.endCondition ?? defaultCheck
        return check(alivePlayers);
    }

    callEvent(eventName, id, data = {})
    {
        data.player = this.#players[id];
        eventManager.callEvent(eventName, data);
    }
}