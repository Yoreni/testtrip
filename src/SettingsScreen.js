class SettingsScreen extends IScene
{
    constructor()
    {
        super();

        this.container = new PIXI.Container();
        this._objects = {};
        this.selectedPlayer = 0;

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

        //make controler selector
        this._objects.controlerSelectorContainer = new PIXI.Container();
        this._objects.controlerSelectorContainer.x = 800;
        this._objects.controlerSelectorContainer.y = 20;
        this.container.addChild(this._objects.controlerSelectorContainer);

        this._objects.lineThing = new PIXI.Graphics()
        this.#drawControlConections(this._objects.lineThing)
        this._objects.controlerSelectorContainer.addChild(this._objects.lineThing);

        this._objects.p1 = new Button("Player 1", {
            onClick: () => 
            { 
                this.selectedPlayer = 0
                this.#showSelectedPlayer()
            }
        })
        this._objects.p1.y = 0
        this._objects.controlerSelectorContainer.addChild(this._objects.p1);

        this._objects.p2 = new Button("Player 2", {
            onClick: () => 
            {
                this.selectedPlayer = 1
                this.#showSelectedPlayer()
            }
        })
        this._objects.p2.y = 50
        this._objects.controlerSelectorContainer.addChild(this._objects.p2);

        this._objects.i1 = new Button("Keyboard", {
            onClick: () =>
            {
                playerInputs[this.selectedPlayer] = InputDevices.KEYBOARD
                this.#drawControlConections(this._objects.lineThing);
            }
        })
        this._objects.i1.y = 0
        this._objects.i1.x = 150
        this._objects.controlerSelectorContainer.addChild(this._objects.i1);

        this._objects.i2 = new Button("Gamepad 1", {
            onClick: () => 
            {
                playerInputs[this.selectedPlayer] = InputDevices.GAMEPAD_0
                this.#drawControlConections(this._objects.lineThing);
            }
        })
        this._objects.i2.y = 50
        this._objects.i2.x = 150
        this._objects.controlerSelectorContainer.addChild(this._objects.i2);

        this._objects.i2 = new Button("Gamepad 2", {
            onClick: () => 
            {
                playerInputs[this.selectedPlayer] = InputDevices.GAMEPAD_1
                this.#drawControlConections(this._objects.lineThing);
            }
        })
        this._objects.i2.y = 100
        this._objects.i2.x = 150
        this._objects.controlerSelectorContainer.addChild(this._objects.i2);

        this._objects.i3 = new Button("Gamepad 3", {
            onClick: () => 
            {
                playerInputs[this.selectedPlayer] = InputDevices.GAMEPAD_2
                this.#drawControlConections(this._objects.lineThing);
            }
        })
        this._objects.i3.y = 150
        this._objects.i3.x = 150
        this._objects.controlerSelectorContainer.addChild(this._objects.i3);

        this._objects.i4 = new Button("Gamepad 4", {
            onClick: () => 
            {
                playerInputs[this.selectedPlayer] = InputDevices.GAMEPAD_3
                this.#drawControlConections(this._objects.lineThing);
            }
        })
        this._objects.i4.y = 200
        this._objects.i4.x = 150
        this._objects.controlerSelectorContainer.addChild(this._objects.i4);
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
            let endY = playerInputs[playerIndex] * 50 + 20
            let endX = 150;
            graphics.moveTo(startX, startY)
                    .lineStyle(3)
                    .bezierCurveTo(startX, startY, (startX + endX) - 100 / 2, (startY + endY) / 2, endX, endY)
              //      .endFill(0x000000);
        }

        // graphics.beginFill(0xff0000);
        // graphics.drawRect(0, 0, 200, 100);
    }

    #showSelectedPlayer()
    {
        this._objects.p1.borderColour = this.selectedPlayer === 0 ? 0xFF0000 : 0x000000
        this._objects.p2.borderColour = this.selectedPlayer === 1 ? 0xFF0000 : 0x000000
    }
}