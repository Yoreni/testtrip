class Button extends PIXI.Container 
{
    static defaultSettings = {
        colour: 0xBBBBBB,
        borderColour: 0x000000,
        onClick: () => {},
    }

    constructor(text, settings = {}) 
    {
        super();
        settings = saveOptionsWithDeafults(settings, Button.defaultSettings);

        this.writing = text;
        this.#applySettings(settings);
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
        let text = new PIXI.Text(writing, {fontSize: 24, fontWeight: "bold", fontFamily: "Calibri", "align": "right",});
        text.position.set(5, 5);
        this.text = text;
        let background = new PIXI.Graphics();
        background.lineStyle(4, this.borderColour, 1);
        background.beginFill(this.colour);
        background.drawRect(0, 0, text.width + 10, text.height + 10);
        background.endFill();
        this.addChild(background);
        this.addChild(text);

        this.text.text = writing;
    }
}