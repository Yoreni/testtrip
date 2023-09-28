const controlDisplayNames = {
    left: "Move Left",
    right: "Move Right",
    softDrop: "Softdrop",
    rotateClockwise: "Rotate Clockwise",
    rotateAnticlockwise: "Rotate Anti-Clockwise",
    hold: "Hold",
    rotate180: "Rotate 180",
    hardDrop: "Harddrop",
    reset: "Reset",
}

class Keyboard 
{
    #player;
    #keys;

    /**
     * 
     * @param {Player} player 
     */
    constructor(player)
    {
        this.#player = player;
        this.#keys = 
        {
            left: new KeyDetector(controls.left),
            right: new KeyDetector(controls.right),
            softDrop: new KeyDetector(controls.softDrop),
            rotateClockwise: new KeyDetector(controls.rotateClockwise),
            rotateAnticlockwise: new KeyDetector(controls.rotateAnticlockwise),
            hold: new KeyDetector(controls.hold),
            rotate180: new KeyDetector(controls.rotate180),
            hardDrop: new KeyDetector(controls.hardDrop),
        }

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
                if (Math.round(key.getSecondsDown() * 1000) < handling.DAS)
                    return;

                //if 0 ARR just teleport it to one of the sides and be done
                if (handling.ARR === 0)
                    this.#player.moveCurrentPiece(dir * 1.79e308)

                const loop = setInterval(() => 
                {
                    const tapback = otherKey.getSecondsDown() > 0 
                            && key.getSecondsDown() > otherKey.getSecondsDown()
                    if (tapback)
                        return;

                    if (key.getSecondsDown() > 0)
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
        if (this.#keys.hardDrop.framesDown === 1)
            this.#player.harddrop();
        if (this.#keys.softDrop.framesDown > 0)
            this.#player.softDrop();
        if (this.#keys.rotateClockwise.framesDown === 1)
            this.#player.rotateClockwise();
        if (this.#keys.rotateAnticlockwise.framesDown === 1)
            this.#player.rotateAnticlockwise();
        if (this.#keys.rotate180.framesDown === 1)
            this.#player.rotate180();
        if (this.#keys.hold.framesDown === 1)
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