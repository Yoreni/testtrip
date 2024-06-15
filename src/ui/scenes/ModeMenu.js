let selectedMode;
let modeSettings;

class ModeMenu extends IScene
{
    static gameModes = ["marathon", "sprint", "ultra", "cheeseRace", "tetraminoArt", "versus", "c4wcombos"];
    #objects;

    constructor()
    {
        super();
        selectedMode = "dev"//ModeMenu.gameModes[0];

        this.container = new PIXI.Container();
        this.#objects = {};

        this.#objects.modes = new PIXI.Container();
        this.#setupModeSelectionButtons(this.#objects.modes)
        this.container.addChild(this.#objects.modes)

        this.#objects.play = new Button(langManager.get("play"), {colour: 0x00FF00});
        this.#objects.play.position.set(app.view.width / 2, app.view.height - this.#objects.play.height);
        this.#objects.play.onClick = () => this.#gotoGame();
        this.container.addChild(this.#objects.play)

        this.#objects.settings = new Button(langManager.get("settings"));
        this.#objects.settings.position.set(app.view.width - 100, 10);
        this.#objects.settings.onClick = () => sceneManager.start("settings");
        this.container.addChild(this.#objects.settings)

        this.#objects.modeSettingContainer = {}
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

    #gotoGame()
    {
        modeSettings = this.#getModeSettings(selectedMode);
        sceneManager.start("game");
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

    /**
     * select a new mode and show it on the UI
     * 
     * @param {string} newMode mode identifer 
     */
    #switchMode(newMode)
    {
        this.#makeModeSettingInputs(newMode);

        const oldModesSettingsContainer = this.#objects.modeSettingContainer[selectedMode];
        const newModesSettingsContainer = this.#objects.modeSettingContainer[newMode];

        if (oldModesSettingsContainer !== undefined)
            oldModesSettingsContainer.visible = false;
        if (newModesSettingsContainer !== undefined)
            newModesSettingsContainer.visible = true;

        selectedMode = newMode;
    }

    /**
     * gets the mode settings that the user has set
     * 
     * @param {string} mode mode identifer
     * @returns {object(string, any)}
     */
    #getModeSettings(mode)
    {
        const modesSettingsFields = this.#objects.modeSettingContainer[mode]?.feilds;
        if (modesSettingsFields === undefined)
            return {}

        let settings = {};
        for (let [settingName, userInput] of Object.entries(modesSettingsFields))
            settings[settingName] = userInput.value;

        return settings;
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
            return; //dont make it if the mode doesnt have any config settings
        if (this.#objects.modeSettingContainer[modeName] !== undefined)
            return; //dont make it if it has already been made

        let container = new PIXI.Container();
        container.feilds = {};
        container.position.set(300,100)
        container.visible = false;

        let index = 0;
        for (let [fieldName, settings] of Object.entries(configFields))
        {
            const InputType = settings.type;
            container.feilds[fieldName] = new InputType(settings);
            container.feilds[fieldName].y = index * 100;
            container.addChild(container.feilds[fieldName]);

            ++index;
        }

        this.container.addChild(container);
        this.#objects.modeSettingContainer[modeName] = container;
    }
}