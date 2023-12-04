const GamepadButton = Object.freeze({
    B: 0,
    A: 1,
    Y: 2,
    X: 3,
    LEFT_BUMPER: 4,
    RIGHT_BUMPER: 5,
    LEFT_TRIGGER: 6,
    RIGHT_TRIGGER: 7,
    BACK: 8,
    START: 9,
    LEFT_STICK: 10,
    RIGHT_STICK: 11,
    UP_DPAD: 12,
    DOWN_DPAD: 13,
    LEFT_DPAD: 14,
    RIGHT_DPAD: 15,
    HOME: 16,
})

class GamepadButtonDetector
{
    #tick;
    #framesPressed;
    #startOfPress;
    #pressedLastCheck;

    constructor(button, index)
    {
        this.button = button;
        this.index = index;
        this.onDown = () => {}
        this.onUp = () => {}
        this.#framesPressed = 0;
        this.#pressedLastCheck = false;

        this.#setupTicker()
    }

    get value()
    {
        const value = this.#gamepad.buttons[this.button].value
        this.#handlePress(value > 0);
        return value;
    }

    get pressed()
    {
        const pressed = this.#gamepad.buttons[this.button].pressed
        this.#handlePress(pressed);
        return pressed;
    }

    get framesPressed()
    {
        return this.#framesPressed
    }

    get secondsPressed()
    {
        if (this.#startOfPress === undefined)
            return 0;

        const pressed = this.pressed
        return pressed ? ((new Date().getTime()) - this.#startOfPress) / 1000 : 0
    }

    #handlePress(pressed)
    {
        if (this.#pressedLastCheck && !pressed)
            this.onUp();
        else if (!this.#pressedLastCheck && pressed)
        {
            this.#startOfPress = new Date();
            this.onDown();
        }

        this.#pressedLastCheck = pressed
    }

    get #gamepad()
    {
        return navigator.getGamepads()[this.index];
    }

    #setupTicker()
    {
        this.#tick = function(delta) 
        {
            if (this.pressed)
                this.#framesPressed += 1;
            else
                this.#framesPressed = 0
        }
        app.ticker.add(this.#tick.bind(this))
    }
}