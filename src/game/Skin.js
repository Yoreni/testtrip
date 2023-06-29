let currentSkin = null;

class Skin
{
    constructor(packJson, urls)
    {
        this._packData = packJson;
        this._urls = urls;
        this._textureCache = {};
        this._loaded = false;

        this._loadTextures();
    }

    get name()
    {
        return this._packData["name"];
    }

    get author()
    {
        return this._packData["author"];
    }

    get id()
    {
        return this._packData["internalName"];
    }

    get loaded()
    {
        return this._loaded;
    }

    getTexture(minoType)
    {
        if (this._textureCache[minoType] !== undefined)
            return this._textureCache[minoType];
        return this._textureCache["*"]
    }

    async _loadTextures()
    {
        for (let [minoType, url] of Object.entries(this._urls))
            this._textureCache[minoType] = await PIXI.Texture.fromURL(url);
        this._loaded = true;
        console.log(`Skin ${this.name} by ${this.author} loaded`);
        // this is temporary skins will be changed thru a UI or when a mode says so
        currentSkin = this;
    }
}