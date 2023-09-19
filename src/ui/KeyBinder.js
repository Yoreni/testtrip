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

class KeyBinder extends Button
{
    static defaultSettings = {
        colour: 0xBBBBBB,
        borderColour: 0x000000,
        size: 32,
        onKeybindChange: (key) => {},
        default: ""
    }

    constructor(settings = {})
    {
        settings = saveOptionsWithDeafults(settings, KeyBinder.defaultSettings)
        super(keyCodesToPrettySymbols[settings.default] ?? settings.default, {
            colour: settings.colour,
            borderColour: settings.borderColour,
            width: settings.size,
            height: settings.size,
            fixed: true,
            onClick: () => {
                this.waitingForKeypress = true,
                this.draw("?")
            }
        });

        this.waitingForKeypress = false;

        document.addEventListener('keydown', (e) =>
        {
            e.preventDefault();
            if(this.waitingForKeypress)
            {
                this.draw(keyCodesToPrettySymbols[e.key] ?? e.key)
                this.waitingForKeypress = false;
                settings.onKeybindChange(e.key);
            }
        }, false)
    }
}