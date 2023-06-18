class AddonMangaer
{
    constructor()
    {
        this.addons = {};
    }

    register(name, funkshun)
    {
        this.addons[name] = funkshun
    }

    applyAddons(mode)
    {
        for (let addonName of mode.addons)
            this.addons[addonName]()
    }
}

const addonMangaer = new AddonMangaer();