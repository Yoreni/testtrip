class Slider extends PIXI.Container 
{
    #settings;
    #values;

    static defaultSettings = {
        // colour: 0xBBBBBB,
        // borderColour: 0x000000,
        whileChanging: (value) => {},
        valueDisplay: (value) => value,
        min: 0,
        max: 100,
        default: 50,
        step: 25,
        label: "",
        width: 0,
        height: 0,
        vertical: false,
    }

    constructor(settings = {}) 
    {
        super();
        this.#settings = saveOptionsWithDeafults(settings, Slider.defaultSettings);
        this.elements = {};
        this.interactive = true;
        this.#values = {};              //values that dont change that often but used fequently in calculations
        this.#values.valueRange = this.#settings.max - this.#settings.min;

        this.#draw();
    }

    #draw()
    {
        this.elements.valueText = new PIXI.Text(this.#settings.default, {fontSize: 24, fontWeight: "bold", fontFamily: "Calibri", "align": "center",})
        this.elements.valueText.y = -this.elements.valueText.height - 10;
        this.elements.valueText.pivot.x = this.elements.valueText.width / 2;
        this.addChild(this.elements.valueText);
        
        let track = new PIXI.Graphics();
        track.lineStyle(4, 0x000000, 1);
        track.beginFill(0x000000);
        track.drawRect(0, 0, this.#settings.width, this.#settings.height);
        track.endFill();
        this.addChild(track);

        if (this.#settings.label !== "")    //dont bother with the label text if label is nothing
        {
            this.elements.labelText = new PIXI.Text(this.#settings.label, {fontSize: 24, fontWeight: "bold", fontFamily: "Calibri", "align": "center",})
            this.elements.labelText.x = -5;
            this.elements.labelText.pivot.x = this.elements.labelText.width;
            this.addChild(this.elements.labelText);
        }

        this.#makeKnob();
        this.setSlider(this.#settings.default)
    }

    /**
     * sets the slider to a value
     * 
     * @param {Number} value 
     */
    setSlider(value)
    {
        this.#setSlider((value - this.#settings.min) / this.#values.valueRange)
    }

    #setSlider(rawProgress)
    {
        let value = (this.#values.valueRange * rawProgress) + this.#settings.min;
        //aply step
        value = Math.round(value * (1 / this.#settings.step)) /(1 / this.#settings.step)
        value = clamp(value, this.#settings.min, this.#settings.max);
        const progress = (value - this.#settings.min) / this.#values.valueRange;

        this.elements.knob.x = this.#values.maxX * progress;

        this.elements.valueText.text = this.#settings.valueDisplay(value);
        this.elements.valueText.pivot.x = this.elements.valueText.width / 2;
        this.elements.valueText.x = this.elements.knob.x
        this.#settings.whileChanging(value);
    }

    #makeKnob()
    {
        this.elements.knob = new PIXI.Graphics();
        let knob = this.elements.knob;
        knob.lineStyle(4, 0x777777, 1);
        knob.beginFill(0xc1bfc0);
        knob.drawRect(0, 0, 10, this.#settings.height + 10);
        knob.endFill();
        knob.pivot.y = knob.height / 2; //put the knob in the middle of the track
        knob.y = knob.height / 3;
        this.#values.maxX = this.#settings.width - (this.elements.knob.width / 2);

        const onDragStart = (event, sprite) =>
        {
            if(sprite.dragAndDropEnabled) 
            {
                sprite.localX = event.data.global.x - sprite.x
                sprite.localY = event.data.global.y - sprite.y
    
                sprite.dragging = true;
            }
        }
    
        const onMouseMove = (event, sprite) =>
        {
            if (sprite.dragging) 
            {
                // let y = sprite.y = event.data.global.y - sprite.localY

                const x = clamp(event.data.global.x - sprite.localX, 0, this.#values.maxX);
                const rawProgress = x / this.#values.maxX;
                this.#setSlider(rawProgress);
            }
        }
    
        const onDragEnd = (event, sprite) =>
        {
            if(sprite.dragging)
            {
                sprite.dragging = false;
            }
        }
        
        knob.interactive = true
        knob.dragAndDropEnabled = true

        knob.on('pointerdown', (e) => onDragStart(e, knob))
            .on('pointerup', (e) => onDragEnd(e, knob))
            .on('pointerupoutside', (e) => onDragEnd(e, knob))
            .on('globalpointermove',  (e) => onMouseMove(e, knob))

        this.addChild(knob);
    }
}