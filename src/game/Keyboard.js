const handling = {
    DAS: 125,
    SDF: 1.79e308,
    ARR: 16,
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
            left: new KeyDetector(app, "ArrowLeft"),
            right: new KeyDetector(app, "ArrowRight"),
            softDrop: new KeyDetector(app, "ArrowDown"),
            rotateClockwise: new KeyDetector(app, "ArrowUp"),
            rotateAnticlockwise: new KeyDetector(app, "z"),
            hold: new KeyDetector(app, "x"),
            rotate180: new KeyDetector(app, "c"),
            hardDrop: new KeyDetector(app, " "),
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
}