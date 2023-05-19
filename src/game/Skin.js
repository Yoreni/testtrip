class Skin
{
    constructor(packJson, urls)
    {
        this.#packData = packJson;
        this.#urls = urls;
        this.#textureCache = {};
    }

    get name()
    {
        this.#packData.name;
    }

    get author()
    {
        this.#packData.author;
    }

    get id()
    {
        this.#packData.internalName;
    }

    getTexture(minoType)
    {
        //if we already cahced it get it from there
        if (this.#textureCache[minoType] !== undefined)
            return this.#textureCache[minoType];

        //get the urls
        let url;
        if (this.#urls[minoType] === undefined) //for other mino types not speified in the the skinData
            url = this.#urls["*"]
        else
            url = this.#urls[minoType]

        let texture = PIXI.Texture.fromURL(url).then(texture => texture);
        this.#textureCache[minoType] = texture;
        return texture;
    }
}