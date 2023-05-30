// why does this even exist

class ModeManager
{
    #modes

    constructor()
    {
        this.#modes = {};
    }

    get(mode)
    {
        return this.#modes[mode];
    }

    register(name, modeData)
    {
        this.#modes[name] = modeData;
    }
}

const modeManager = new ModeManager();