class AddonMangaer
{
    constructor()
    {
        this.addons = {};
    }

    register(name, addon)
    {
        this.addons[name] = addon
    }

    applyAddons(mode)
    {
        //an array to keep track of addons added so we dont add the same one twice
        let applied = []

        const applyAddon = (name) =>
        {
            if (!applied.includes(name))
            {
                this.addons[name].onAdd();
                applied.push(name);
                console.info(`Addon ${name} applied`);
            }
        }

        const addons = mode.addons ?? []
        for (let addonName of addons)
        {
            const dependencies = this.addons[addonName].depend ?? [];
            for (let dependeny of dependencies)
                applyAddon(dependeny)
            applyAddon(addonName)
        }
    }

    removeAllAddons()
    {
        //TODO implement this. this removes addons events
    }
}

const addonMangaer = new AddonMangaer();