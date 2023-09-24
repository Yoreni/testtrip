class SettingsScreen extends IScene
{
    constructor()
    {
        super();

        this.container = new PIXI.Container();
        this._objects = {};

        this._objects.back = new Button("Back", {colour: 0xFF5959});
        this._objects.back.position.set(8, app.view.height - this._objects.back.height - 5);
        this._objects.back.onClick = () => 
        {
            saveSettingsToLocalStorange();
            sceneManager.start("modeMenu");
        }
        this.container.addChild(this._objects.back)

        const dimensions = {width: 200, height: 15}

        this._objects.dasSlider = new Slider({
            ...dimensions,
            label: "DAS", 
            min: 17, 
            max: 333,
            default: handling.DAS,
            step: 16,
            valueDisplay: (value) => `${value}ms`,
            whileChanging: (value) => handling.DAS = value,
        });
        this._objects.dasSlider.position.set(100, 100);
        this.container.addChild(this._objects.dasSlider)

        this._objects.arrSlider = new Slider({
            ...dimensions, 
            label: "ARR", 
            min: 0, 
            max: 83,
            default: handling.ARR,
            step: 1,
            valueDisplay: (value) => `${value}ms`,
            whileChanging: (value) => handling.ARR = value,
        });
        this._objects.arrSlider.position.set(100, 150);
        this.container.addChild(this._objects.arrSlider)

        this._objects.sdfSlider = new Slider({
            ...dimensions,
            label: "SDF", 
            min: 5, 
            max: 41,
            default: handling.SDF,
            step: 1,
            valueDisplay: (value) => `x${value === 41 ? "∞" : value}`,
            whileChanging: (value) => handling.SDF = value === 41 ? 1.79e308 : value,
        });
        this._objects.sdfSlider.position.set(100, 200);
        this.container.addChild(this._objects.sdfSlider);

        // make keybind buttons
        Object.keys(controls).forEach((key, index) => {
            let keybinder =  this.#makeKeybindButton(controlDisplayNames[key], key);
            keybinder.position.set(600, 100 + (index * 40));
            this.container.addChild(keybinder);
        })
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
     * @param {String} displayName 
     * @param {String} control
     */
    #makeKeybindButton(displayName, control)
    {
        let container = new PIXI.Container();
        let keyBinder = new KeyBinder({
            onKeybindChange: (key) => controls[control] = key,
            default: controls[control],
        });
        container.addChild(keyBinder);

        let label = new PIXI.Text(displayName, textStyle());
        label.pivot.x = label.width;
        label.x = -5;
        container.addChild(label);

        return container;
    }
}