class CircleBar extends PIXI.Container 
{
    #settings;

    static defaultSettings = {
        colour: 0xBBBBBB,
        label: "",
        radius: 40,
    }

    constructor(progress, settings = {})
    {
        super();
        this.sortableChildren = true;
        this.#settings = saveOptionsWithDeafults(settings, CircleBar.defaultSettings);
    
        this.circle = new PIXI.Graphics();
        this.draw(progress)
        this.circle.rotation = -Math.PI / 2;

        this.label = new PIXI.Text(this.#settings.label);
        this.label.pivot.x = this.label.width / 2;
        this.label.pivot.y = this.label.height / 2;
        this.label.zIndex = 1           // stops the circle covering the text.
        this.addChild(this.label);
    }

    draw(progress)
    {
        progress = clamp(progress, 0, 1);

        this.circle.clear();

        if (progress === 0)
            return;

        this.circle.beginFill(this.#settings.colour);
        this.circle.lineStyle(2, this.#settings.colour);
        this.circle.arc(0, 0, this.#settings.radius, 0, Math.PI * 2 * progress);
        this.circle.lineTo(0, 0)
        this.circle.lineTo(this.#settings.radius, 0)
        this.circle.endFill();
        this.addChild(this.circle);
    }
}