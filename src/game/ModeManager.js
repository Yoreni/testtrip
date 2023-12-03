// why does this even exist

class ModeManager
{
    #modes

    constructor()
    {
        this.#modes = {};
    }

    get(modeName, modeOptions = {})
    {
        let mode = this.#modes[modeName];
        mode.name = modeName;

        if (mode.load !== undefined)
            mode.load(modeOptions)

        return mode;
    }

    register(name, modeData)
    {
        this.#modes[name] = modeData;
    }
}

const modeManager = new ModeManager();