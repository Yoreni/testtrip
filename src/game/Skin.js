let currentSkin = null;

class Skin
{
    #packData;
    #urls;
    #textureCache;
    #loaded;

    constructor(packJson, urls)
    {
        this.#packData = packJson;
        this.#urls = urls;
        this.#textureCache = {};
        this.#loaded = false;
    }

    get name()
    {
        return this.#packData["name"];
    }

    get author()
    {
        return this.#packData["author"];
    }

    get id()
    {
        return this.#packData["internalName"];
    }

    get loaded()
    {
        return this.#loaded;
    }

    getTexture(minoType)
    {
        if (!this.loaded)
            throw `The skin with id ${this.id} has not been loaded yet`;

        if (this.#textureCache[minoType] !== undefined)
            return this.#textureCache[minoType];
        return this.#textureCache["*"]
    }

    async loadTextures()
    {
        for (let [minoType, url] of Object.entries(this.#urls))
            this.#textureCache[minoType] = await PIXI.Texture.fromURL(url);
        this.#loaded = true;
        console.log(`Skin ${this.name} by ${this.author} loaded`);
        // this is temporary skins will be changed thru a UI or when a mode says so
        currentSkin = this;
    }
}