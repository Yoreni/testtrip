class SettingsScreen extends IScene
{
    constructor()
    {
        super();

        this.container = new PIXI.Container();
        this._objects = {};
        this.selectedPlayer = null;
        this.gamepadDetectionIndicater = [0, 0, 0, 0]; // used to show to the user that a gamepad recived inputs

        this._objects.back = new Button(langManager.get("back"), {colour: 0xFF5959});
        this._objects.back.position.set(8, app.view.height - this._objects.back.height - 5);
        this._objects.back.onClick = () => 
        {
            saveSettingsToLocalStorange();
            sceneManager.start("modeMenu");
        }
        this.container.addChild(this._objects.back)

        this.#drawHandleingSliders();

        // make keybind buttons
        controlNames.forEach((key, index) => 
        {
            let keybinder =  this.#makeKeybindButton(key);
            keybinder.position.set(600, 100 + (index * 40));
            this.container.addChild(keybinder);
        })

        //make controler selector
        this._objects.controlerSelectorContainer = new PIXI.Container();
        this._objects.controlerSelectorContainer.x = 800;
        this._objects.controlerSelectorContainer.y = 20;
        this.container.addChild(this._objects.controlerSelectorContainer);

        this._objects.lineThing = new PIXI.Graphics()
        this.#drawControlConections(this._objects.lineThing)
        this._objects.controlerSelectorContainer.addChild(this._objects.lineThing);

        for (let index = 0; index < 2; ++index)
        {
            const button = new Button(langManager.get("menu.settings.playern", index + 1), {
                onClick: () => 
                { 
                    this.selectedPlayer = index
                    this.#showSelectedPlayer()
                    this.#drawControlConections(this._objects.lineThing)
                }
            })
            button.y = index * 50

            this._objects.controlerSelectorContainer.addChild(button);
            this._objects[`p${index + 1}`] = button;
        }

        const inputDeviceMap = [InputDevices.KEYBOARD, InputDevices.GAMEPAD_0, InputDevices.GAMEPAD_1, InputDevices.GAMEPAD_2, InputDevices.GAMEPAD_3]
        for (let index = 0; index < 5; ++index)
        {
            const buttonText = index == 0 ? langManager.get("menu.settings.keyboard") : langManager.get("menu.settings.gamepadn", index)
            const button = new Button(buttonText, {
                onClick: () =>
                {
                    const inputDevice = inputDeviceMap[index]
                    // clicking on the same button will allow the user to unconnect a player to an input device.
                    playerInputs[this.selectedPlayer] = playerInputs[this.selectedPlayer] === inputDevice
                        ? null : inputDevice
                    this.#drawControlConections(this._objects.lineThing);
                }
            })
            button.y = index * 50
            button.x = 150
            this._objects.controlerSelectorContainer.addChild(button);
            this._objects[`i${index + 1}`] = button;
        }

        this.#drawLangaugeMenu();
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
        // show controler response
        for (let gamepadIndex = 0; gamepadIndex < 4; ++gamepadIndex)
        {
            if (!controllerIndex.includes(gamepadIndex))
            {
                this.gamepadDetectionIndicater[gamepadIndex] -= 1;
                continue;
            }

            const gamepad = navigator.getGamepads()[gamepadIndex]
            if (gamepad.buttons.some(button => button.pressed))
                this.gamepadDetectionIndicater[gamepadIndex] = 30
            else
                this.gamepadDetectionIndicater[gamepadIndex] -= 1;
        }

        for (const [index, button] of Object.entries([this._objects.i2, this._objects.i3, this._objects.i4, this._objects.i5]))
        {
            if (button !== undefined)
                button.borderColour = interpolateColour(0x000000, 0x00a8e0, this.gamepadDetectionIndicater[index] / 30)
        }
    }

    destory()
    {

    }

    init()
    {

    }

    #drawHandleingSliders()
    {
        const dimensions = {width: 200, height: 15}

        this._objects.dasSlider = new Slider({
            ...dimensions,
            label: langManager.get("menu.settings.DAS"), 
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
            label: langManager.get("menu.settings.ARR"), 
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
            label: langManager.get("menu.settings.SDF"), 
            min: 5, 
            max: 41,
            default: handling.SDF,
            step: 1,
            valueDisplay: (value) => `x${value === 41 ? "∞" : value}`,
            whileChanging: (value) => handling.SDF = value === 41 ? 1.79e308 : value,
        });
        this._objects.sdfSlider.position.set(100, 200);
        this.container.addChild(this._objects.sdfSlider);
    }

    /**
     * 
     * @param {String} control
     */
    #makeKeybindButton(control)
    {
        let container = new PIXI.Container();
        let keyBinder = new KeyBinder({
            onKeybindChange: (key) => controls[control] = key,
            default: controls[control],
        });
        container.addChild(keyBinder);

        let label = new PIXI.Text(langManager.get(`menu.settings.${control}`), textStyle());
        label.pivot.x = label.width;
        label.x = -5;
        container.addChild(label);

        return container;
    }

    /**
     * 
     * @param {PIXI.Graphics} graphics 
     */
    #drawControlConections(graphics)
    {
        graphics.clear()
        for (let playerIndex = 0; playerIndex < 2; ++playerIndex)
        {
            if (playerInputs[playerIndex] === null)
                continue

            let startX = 80;
            let startY = playerIndex * 50 + 20;
            let endY = (playerInputs[playerIndex]) * 50 + 20
            let endX = 150;
            graphics.moveTo(startX, startY)
                    .lineStyle(3, playerIndex === this.selectedPlayer ? 0xFF0000 : 0x000000)
                    .bezierCurveTo(startX, startY, (startX + endX) - 100 / 2, (startY + endY) / 2, endX, endY)
        }
    }

    #showSelectedPlayer()
    {
        this._objects.p1.borderColour = this.selectedPlayer === 0 ? 0xFF0000 : 0x000000
        this._objects.p2.borderColour = this.selectedPlayer === 1 ? 0xFF0000 : 0x000000
    }

    #drawLangaugeMenu()
    {
        let button = new Button(langManager.get("menu.settings.langauge"), {
            onClick: () => this._objects.langaugeMenuContainer.open()
        })
        button.position.set(100, 250)
        this.container.addChild(button);

        this._objects.langaugeMenuContainer = new LangaugeSelector();
        this._objects.langaugeMenuContainer.position.set(128, 128);
        this.container.addChild(this._objects.langaugeMenuContainer);
    }
}