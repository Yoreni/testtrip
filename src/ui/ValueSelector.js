class ValueSelector extends PIXI.Container
{
    static #defaultSettings = {
        width: 150,
        options: [Option("one", 1), Option("two", 2)],
        defaultIndex: 0,
        title: ""
    }

    #settings;
    #index;
    #displayText;

    constructor(settings)
    {
        super();
        this.#settings = saveOptionsWithDeafults(settings, ValueSelector.#defaultSettings);
        this.#index = this.#settings.defaultIndex;

        let decrementIndexButton = new Button("<", {
            onClick: () => this.#changeIndex(-1)
        });
        this.addChild(decrementIndexButton);

        this.#displayText = new PIXI.Text(this.#index, textStyle())
        this.#updateText();
        this.#displayText.y = decrementIndexButton.height / 2;
        this.#displayText.x = (this.#settings.width / 2) + (decrementIndexButton.width);
        this.#displayText.pivot.y = decrementIndexButton.height / 2;
        this.addChild(this.#displayText)

        let incrementIndexButton = new Button(">", {
            onClick: () => this.#changeIndex(1)
        });
        incrementIndexButton.x = this.#settings.width + decrementIndexButton.width;
        this.addChild(incrementIndexButton);

        if (this.#settings.title !== "")
        {
            let titleText = new PIXI.Text(this.#settings.title, textStyle())
            titleText.style.bold = true
            titleText.pivot.x = titleText.width / 2;
            titleText.x = (this.#settings.width / 2) + (decrementIndexButton.width);
            titleText.y = -8;
            titleText.pivot.y = decrementIndexButton.height / 2;
            this.addChild(titleText);
        }
    }

    #changeIndex(amount)
    {
        this.#index = mod(this.#index + amount, this.#settings.options.length); 
        this.#updateText();
    }

    #updateText()
    {
        this.#displayText.text = this.#settings.options[this.#index].display;
        this.#displayText.pivot.x = this.#displayText.width / 2;
    }

    get value()
    {
        return this.#settings.options[this.#index].value;
    }

    get displayText()
    {
        return this.#settings.options[this.#index].display;
    }

    get index()
    {
        return this.#index;
    }
}

function Option(display, value)
{
    if (value == undefined)
        return {"display": display.toString(), "value": display};
    return {display, value};
}