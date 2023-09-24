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

    #applySettings(settings)
    {
        this.onClick = settings.onClick;
        this.colour = settings.colour;
        this.borderColour = settings.borderColour;
    }
    
    draw(writing) 
    {
        this.removeChildren();
        if (writing == null) 
            writing = this.writing;
        let text = new PIXI.Text(writing, textStyle());
        text.pivot.x = text.width / 2;
        this.text = text;

        const calcDimension = (textDim, setDim) => this.#settings.fixed || textDim + 10 < setDim ? setDim : textDim + 10
        const width = calcDimension(text.width, this.#settings.width)
        const height = calcDimension(text.height, this.#settings.height)
        text.position.set(width / 2, 5);

        let background = new PIXI.Graphics();
        background.lineStyle(4, this.borderColour, 1);
        background.beginFill(this.colour);
        background.drawRect(0, 0, width, height);
        background.endFill();
        this.addChild(background);
        this.addChild(text);

        this.text.text = writing;
    }
}