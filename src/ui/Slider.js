class Slider extends PIXI.Container 
{
    #settings;

    static defaultSettings = {
        // colour: 0xBBBBBB,
        // borderColour: 0x000000,
        whileChanging: (value) => {},
        min: -25,
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
        console.log(this.#settings)
        this.elements = {};
        this.interactive = true;

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

        this.#makeKnob();
    }

    #makeKnob()
    {
        let knob = new PIXI.Graphics();
        knob.lineStyle(4, 0x777777, 1);
        knob.beginFill(0xc1bfc0);
        knob.drawRect(0, 0, 10, this.#settings.height + 10);
        knob.endFill();
        knob.pivot.y = knob.height / 2; //put the knob in the middle of the track
        knob.y = knob.height / 3;

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

                const maxX = this.#settings.width - (sprite.width / 2);
                const x = clamp(event.data.global.x - sprite.localX, 0, maxX);
                const rawProgress = x / maxX;

                let value = ((this.#settings.max - this.#settings.min) * rawProgress) + this.#settings.min;
                //aply step
                value = Math.round(value * (1 / this.#settings.step)) /(1 / this.#settings.step)
                value = clamp(value, this.#settings.min, this.#settings.max);
                const progress = (value - this.#settings.min) / (this.#settings.max - this.#settings.min);

                sprite.x = maxX * progress;

                this.elements.valueText.text = value;
                this.elements.valueText.pivot.x = this.elements.valueText.width / 2;
                this.elements.valueText.x = sprite.x
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
        // knob.on('mousedown', (e) => onDragStart(e, knob));
        // knob.on('mousemove',  (e) => onMouseMove(e, knob));
        // knob.on('mouseup', (e) => onDragEnd(e, knob));
        // knob.on('mouseupoutside', (e) => onDragEnd(e, knob));

        knob.on('pointerdown', (e) => onDragStart(e, knob))
            .on('pointerup', (e) => onDragEnd(e, knob))
            .on('pointerupoutside', (e) => onDragEnd(e, knob))
            .on('globalpointermove',  (e) => onMouseMove(e, knob))

        this.addChild(knob);
    }
}