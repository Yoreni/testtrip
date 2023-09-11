// why does this even exist

class ModeManager
{
    #modes

    constructor()
    {
        this.#modes = {};
    }

    get(modeName)
    {
        let a = this.#modes[modeName];
        a.name = modeName;
        return a;
    }

    register(name, modeData)
    {
        this.#modes[name] = modeData;
    }
}

const modeManager = new ModeManager();