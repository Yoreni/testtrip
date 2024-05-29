class ValueSelector extends PIXI.Container
{
    static #defaultSettings = {
        width: 150,
        options: [Option("one", 1), Option("two", 2)],
        defaultIndex: 0
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

        this.#displayText = new PIXI.Text(this.#index)
        this.#updateText();
        this.addChild(this.#displayText)

        let incrementIndexButton = new Button(">", {
            onClick: () => this.#changeIndex(1)
        });
        incrementIndexButton.x = this.#settings.width;
        this.addChild(incrementIndexButton);



    }

    #changeIndex(amount)
    {
        this.#index = mod(this.#index + amount, this.#settings.options.length); 
        this.#updateText();
    }

    #updateText()
    {
        this.#displayText.text = this.#index;
        this.#displayText.pivot.x = this.#displayText.width / 2;
        this.#displayText.pivot.y = this.#displayText.height / 2;
        this.#displayText.x = this.#settings.width / 2;
    }

    get value()
    {
        throw "Not Implemented";
    }

    get index()
    {
        throw "Not Implemented";
    }
}

function Option(display, value)
{
    return {display, value};
}