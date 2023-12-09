const GamepadAxis = Object.freeze({
    LEFT: (x, y) => y < -x && y > x, 
    RIGHT: (x, y) => y > -x && y < x,
    DOWN: (x, y) => y > -x && y > x,
    UP: (x, y) => y < -x && y < x,
})

class GamepadAxisDetector
{
    static DEAD_ZONE = 0.06;

    #condition;
    #isLeftStick;
    #tick;
    #framesHeld;
    #startOfHold;
    #heldLastCheck;

    /**
     * 
     * @param {function(Number, Number): Boolean} condition a function the takes x and y values and returns a boolean
     * @param {Number} index 
     * @param {Boolean} leftStick 
     */
    constructor(condition, index, leftStick)
    {
        this.#condition = (x, y) => condition(x, y) && GamepadAxisDetector.isOutsideDeadZone(x, y);
        this.index = index;
        this.#isLeftStick = leftStick;
        this.#framesHeld = 0;
        this.#heldLastCheck = false;

        this.onDown = () => {}
        this.onUp = () => {}

        this.#setupTicker();
    }

    static isOutsideDeadZone(x, y)
    {
        const distanceFromCenter = Math.sqrt(( x ** 2) + (y ** 2))
        return distanceFromCenter > GamepadAxisDetector.DEAD_ZONE
    }

    get axes()
    {
        const axes = navigator.getGamepads()[this.index].axes
        return this.#isLeftStick ? Point(axes[0], axes[1]) : Point(axes[2], axes[3])    
    }

    get framesPressed()
    {
        return this.#framesHeld
    }

    get pressed()
    {
        const axes = this.axes;
        const pressed = this.#condition(axes.x, axes.y);
        this.#handleInput(pressed);
        return pressed
    }

    get secondsPressed()
    {
        if (this.#startOfHold === undefined)
            return 0;

        return this.pressed ? ((new Date().getTime()) - this.#startOfHold) / 1000 : 0;
    }

    #handleInput(held)
    {
        if (this.#heldLastCheck && !held)
            this.onUp();
        else if (!this.#heldLastCheck && held)
        {
            this.#startOfHold = new Date();
            this.onDown();
        }

        this.#heldLastCheck = held;
    }

    #setupTicker()
    {
        this.#tick = function(delta) 
        {
            if (this.pressed)
                this.#framesHeld += 1;
            else
                this.#framesHeld = 0
        }
        app.ticker.add(this.#tick.bind(this));
    }
}