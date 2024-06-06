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

        mode.gameRules = {}
        if (mode.load !== undefined)
            mode.load(modeOptions, mode.gameRules)

        return mode;
    }

    getConfigFields(modeName)
    {
        return this.#modes[modeName].config;
    }

    register(name, modeData)
    {
        this.#modes[name] = modeData;
    }
}

const modeManager = new ModeManager();