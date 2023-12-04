class Gamepad 
{
    #player;
    #keys;
    #gamepad;
    #controllerIndex

    /**
     * 
     * @param {Player} player 
     * @param {Number} controllerIndex
     */
    constructor(player, controllerIndex)
    {
        this.#player = player;
        this.#keys = 
        {
            left: new GamepadButtonDetector(GamepadButton.LEFT_DPAD, controllerIndex),
            right: new GamepadButtonDetector(GamepadButton.RIGHT_DPAD, controllerIndex),
            softDrop: new GamepadButtonDetector(GamepadButton.DOWN_DPAD, controllerIndex),
            rotateClockwise: new GamepadButtonDetector(GamepadButton.UP_DPAD, controllerIndex),
            rotateAnticlockwise: new GamepadButtonDetector(GamepadButton.X, controllerIndex),
            hold: new GamepadButtonDetector(GamepadButton.Y, controllerIndex),
            rotate180: new GamepadButtonDetector(GamepadButton.B, controllerIndex),
            hardDrop: new GamepadButtonDetector(GamepadButton.LEFT_BUMPER, controllerIndex),
        }

        if (navigator.getGamepads()[controllerIndex] === undefined)
            throw `Controller ${controllerIndex} not connected`
        this.#controllerIndex = controllerIndex

        //thank you zztetris
        const handlingCode = (dir) =>
        {
            if (this.#player === undefined || !this.#player.isAlive)
                return;

            //-1 is left, 1 is right
            this.#player.moveCurrentPiece(dir);
            const key = dir === 1 ? this.#keys.right : this.#keys.left;
            const otherKey = dir !== 1 ? this.#keys.right : this.#keys.left;

            setTimeout(() =>
            {
                //check if you are still holding the key
                if (Math.round(key.secondsPressed * 1000) < handling.DAS)
                    return;

                //if 0 ARR just teleport it to one of the sides and be done
                if (handling.ARR === 0)
                    this.#player.moveCurrentPiece(dir * 1.79e308)

                const loop = setInterval(() => 
                {
                    const tapback = otherKey.secondsPressed > 0 
                            && key.secondsPressed > otherKey.secondsPressed
                    if (tapback)
                        return;

                    if (key.secondsPressed > 0)
                        this.#player.moveCurrentPiece(dir);
                    else
                        clearInterval(loop);
                }, handling.ARR);
            }, handling.DAS);

        }
        this.#keys.left.onDown = () => handlingCode(-1);
        this.#keys.right.onDown = () => handlingCode(1);
    }

    inputs() 
    {
        //const gamepad = navigator.getGamepads()[this.#controllerIndex]

        // navigator.getGamepads() gets called for every request. maybe an optimisation can remove this.
        if (this.#keys.hardDrop.framesPressed === 1)
            this.#player.harddrop();
        if (this.#keys.softDrop.framesPressed > 0)
            this.#player.softDrop();
        if (this.#keys.rotateClockwise.framesPressed === 1)
            this.#player.rotateClockwise();
        if (this.#keys.rotateAnticlockwise.framesPressed === 1)
            this.#player.rotateAnticlockwise();
        if (this.#keys.rotate180.framesPressed === 1)
            this.#player.rotate180();
        if (this.#keys.hold.framesPressed === 1)
            this.#player.hold();
    }

    get logic()
    {
        return this.#player
    }

    set logic(logicPlayer)
    {
        if (logicPlayer instanceof PlayerLogic)
            this.#player = logicPlayer
        else
            throw "The argument provided is not a logic player";
    }
}