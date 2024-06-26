class Button extends PIXI.Container 
{
    #settings;

    static defaultSettings = {
        colour: 0xBBBBBB,
        borderColour: 0x000000,
        onClick: () => {},
        fixed: false,
        width: 0,
        height: 0,
    }

    constructor(text, settings = {}) 
    {
        super();
        this.#settings = saveOptionsWithDeafults(settings, Button.defaultSettings);

        this.writing = text;
        this.#applySettings(this.#settings);
        this.draw(text);
        this.interactive = true;
        const filter = new PIXI.filters.ColorMatrixFilter();
        this.filters = [filter];

        this.on("pointerover", () => {
            filter.brightness(1.3, false);
        });
        this.on("pointerout", () => {
            filter.brightness(1, false);
        });
        this.on("mousedown", () => {
            filter.brightness(0.8, false);
        });
        this.on("mouseup", () => {
            filter.brightness(1, false);
            this.onClick();
        });
    }

    /**
     * @param {Number} colour 
     */
    set borderColour(colour)
    {
        if (colour === this._borderColour)
            return
        
        this._borderColour = colour
        this.#redraw()
    }

    #applySettings(settings)
    {
        this.onClick = settings.onClick;
        this.colour = settings.colour;
        this._borderColour = settings.borderColour;
    }
    
    draw(writing) 
    {
        if (writing != null) 
            this.writing = writing;
        this.#redraw()
    }

    #redraw()
    {
        this.removeChildren();

        let text = new PIXI.Text(this.writing, textStyle());
        text.pivot.x = text.width / 2;
        this.text = text;
        const calcDimension = (textDim, setDim) => this.#settings.fixed || textDim + 10 < setDim ? setDim : textDim + 10
        const width = calcDimension(this.text.width, this.#settings.width)
        const height = calcDimension(this.text.height, this.#settings.height)
        text.position.set(width / 2, 0);

        let background = new PIXI.Graphics();
        background.lineStyle(4, this._borderColour, 1);
        background.beginFill(this.colour);
        background.drawRect(0, 0, width, height);
        background.endFill();
        this.addChild(background);
        this.addChild(text);
    }
}