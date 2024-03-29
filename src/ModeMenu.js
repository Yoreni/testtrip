let selectedMode;

class ModeMenu extends IScene
{
    static gameModes = ["marathon", "sprint", "ultra", "cheeseRace", "tetraminoArt", "versus", "c4wcombos"];

    constructor()
    {
        super();
        selectedMode = "dev"//ModeMenu.gameModes[0];

        this.container = new PIXI.Container();
        this._objects = {};

        this._objects.modes = new PIXI.Container();
        this.#setupModeSelectionButtons(this._objects.modes)
        this.container.addChild(this._objects.modes)

        this._objects.play = new Button("Play", {colour: 0x00FF00});
        this._objects.play.position.set(app.view.width / 2, app.view.height - this._objects.play.height);
        this._objects.play.onClick = () => sceneManager.start("game");
        this.container.addChild(this._objects.play)

        this._objects.settings = new Button("Settings");
        this._objects.settings.position.set(app.view.width - 100, 10);
        this._objects.settings.onClick = () => sceneManager.start("settings");
        this.container.addChild(this._objects.settings)
    }

    start()
    {
        this.container.visible = true;
    }

    stop()
    {
        this.container.visible = false;
    }

    update(delta)
    {

    }

    destory()
    {

    }

    init()
    {

    }

    /**
     * 
     * @param {PIXI.Container} container 
     */
    #setupModeSelectionButtons(container)
    {
        for (let index = 0; index != ModeMenu.gameModes.length; ++index)
        {
            let button = new Button(ModeMenu.gameModes[index], {width: 200, height: 40, fixed: true})
            button.position.set(10, 50 * index + 10);
            container.addChild(button)
            button.onClick = () => selectedMode = ModeMenu.gameModes[index];
        }
    }
}