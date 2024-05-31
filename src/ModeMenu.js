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

        this._objects.play = new Button(langManager.get("play"), {colour: 0x00FF00});
        this._objects.play.position.set(app.view.width / 2, app.view.height - this._objects.play.height);
        this._objects.play.onClick = () => sceneManager.start("game");
        this.container.addChild(this._objects.play)

        this._objects.settings = new Button(langManager.get("settings"));
        this._objects.settings.position.set(app.view.width - 100, 10);
        this._objects.settings.onClick = () => sceneManager.start("settings");
        this.container.addChild(this._objects.settings)

        this._objects.modeSettingContainer = {}
        this.#makeModeSettingInputs("sprint");
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
            let text = langManager.get(`modes.${ModeMenu.gameModes[index]}`);
            let button = new Button(text, {width: 200, height: 40, fixed: true})
            button.position.set(10, 50 * index + 10);
            container.addChild(button)
            button.onClick = () => this.#switchMode(ModeMenu.gameModes[index]);
        }
    }

    #switchMode(newMode)
    {
        const oldModesSettingsContainer = this._objects.modeSettingContainer[selectedMode];
        const newModesSettingsContainer = this._objects.modeSettingContainer[newMode];

        if (newModesSettingsContainer === undefined)
            this.#makeModeSettingInputs(newMode);

        if (oldModesSettingsContainer !== undefined)
            oldModesSettingsContainer.visible = false;
        if (newModesSettingsContainer !== undefined)
            newModesSettingsContainer.visible = true;

        selectedMode = newMode;
    }

    /**
     * makes the modes settings
     * 
     * @param {string} modeName 
     */
    #makeModeSettingInputs(modeName)
    {
        let configFields = modeManager.getConfigFields(modeName);
        if (configFields === undefined)
            return;
        let container = new PIXI.Container();
        container.feilds = {};
        container.position.set(300,100)
        container.visible = false;

        let index = 0;
        for (let [fieldName, settings] of Object.entries(configFields))
        {
            const InputType = settings.type;
            console.log(settings);
            container.feilds[fieldName] = new InputType(settings);
            container.feilds[fieldName].x = index * 70;
            container.addChild(container.feilds[fieldName]);

            ++index;
        }

        this.container.addChild(container);
        this._objects.modeSettingContainer[modeName] = container;

        // let a = new ValueSelector({options: [Option(1), Option(2), Option(4), Option(10), Option(20), Option(40), Option(100), Option(250), Option(500), Option("1,000", 1000), Option("10,000", 10_000)]});
        // this._objects.text.position.set(300, 300);
        // this.container.addChild(this._objects.text);
    }
}