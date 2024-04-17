{
    const keyCodesToPrettySymbols = {
        "ArrowUp": "↑",
        "ArrowLeft": "←",
        "ArrowRight": "→",
        "ArrowDown": "↓",
        "a": "A",
        "b": "B",
        "c": "C",
        "d": "D",
        "e": "E",
        "f": "F",
        "g": "G",
        "h": "H",
        "i": "I",
        "j": "J",
        "k": "K",
        "l": "L",
        "m": "M",
        "n": "N",
        "o": "O",
        "p": "P",
        "q": "Q",
        "r": "R",
        "s": "S",
        "t": "T",
        "u": "U",
        "v": "V",
        "w": "W",
        "x": "X",
        "y": "Y",
        "z": "Z",
        " ": "␣",
    }

    function getKeyDisplay(key)
    {
        return keyCodesToPrettySymbols[key] ?? key
    }
}

/**
 * 
 * @param {Object} obj 
 * @param {*} valueToFind
 * @returns {Boolean}
 */
function hasDuplicateValues(obj, valueToFind) 
{
    let count = 0;
    for (const value of Object.values(obj))
    {
        if (value === valueToFind)
            ++count;

        if (count >= 2)
            return true
    }

    return false;
}

class KeyBinder extends Button
{
    #settings;

    static defaultSettings = {
        colour: 0xBBBBBB,
        borderColour: 0x000000,
        size: 32,
        onKeybindChange: (key) => {},
        default: ""
    }

    static controlsObject;

    constructor(settings = {})
    {
        settings = saveOptionsWithDeafults(settings, KeyBinder.defaultSettings)
        super(getKeyDisplay(settings.default), {
            colour: settings.colour,
            borderColour: settings.borderColour,
            width: settings.size,
            height: settings.size,
            fixed: true,
            onClick: () => 
            {
                //prevent 2+ keybinders waiting for new inputs. 
                // if (KeyBinder.controlsObject != undefined)
                // {
                //     console.log(KeyBinder.controlsObject)
                //     for (const otherKeyBinder of KeyBinder.controlsObject)
                //         otherKeyBinder.cancelWaitingForKeypress();
                // }

                this.waitingForKeypress = true,
                this.draw("?")
            }
        });

        this.#settings = settings;
        this.waitingForKeypress = false;
        this.key = settings.default;

        document.addEventListener('keydown', (e) =>
        {
            e.preventDefault();
            if(this.waitingForKeypress)
            {
                this.key = e.key;
                this.waitingForKeypress = false;
                this.draw(getKeyDisplay(e.key))
                settings.onKeybindChange(e.key);
            }
        }, false)

        app.ticker.add(this.update.bind(this));
    }

    cancelWaitingForKeypress()
    {
        if (waitingForKeypress === true)
        {
            this.waitingForKeypress = false;
            this.draw(getKeyDisplay(this.key));
        }
    }

    update()
    {
        if (KeyBinder.controlsObject === undefined)
            return;

        // turn the key red if a keybind conflict has been found
        if (hasDuplicateValues(KeyBinder.controlsObject, this.key))
            this.text.style.fill = 0xFF0000;
        else
            this.text.style.fill = 0x000000;
    }
}