"use strict";
let canvasSize = {width: 0, height: 0}

let misaminoPoint = undefined;

let controllerIndex = null

const 
{
    configure,
    BlobReader,
    BlobWriter,
    TextReader,
    TextWriter,
    ZipReader,
    ZipWriter,
    HttpReader,
} = zip;

const SpinType = _enum("NONE", "MINI", "FULL");
const sceneManager = new SceneManager(app);

function init() 
{
    resize();
    app.ticker.maxFPS = 60

    // load assets and fonts
    document.body.appendChild(app.view);
    app.renderer.view.style.position = 'absolute'
    
    //setup scene manager
    sceneManager.add("game", new Game())
    sceneManager.add("modeMenu", new ModeMenu())
    sceneManager.add("settings", new SettingsScreen())
    sceneManager.start("modeMenu")

    setup();
}

function setup() 
{
    let debugMenu = new DebugMenu(app)
    app.stage.addChild(debugMenu.container)

    app.ticker.add((delta) => {
        stats.begin();
        handleControllerInputs(controllerIndex)
        stats.end();
    });
}

window.addEventListener('resize', function()
{
    resize()
});

function resize()
{
        var h = 640;
	    var width = window.innerWidth || document.body.clientWidth; 
	    var height = window.innerHeight || document.body.clientHeight; 
        var ratio = height / h;
        var view = app.view;

        view.style.height = (h * ratio) + "px";
        var newWidth = (width / ratio);
        view.style.width = width + "px";
	
        app.renderer.resize(newWidth , h);

        canvasSize.width = newWidth
        canvasSize.height = h
        console.log(`Resied to a width of ${canvasSize.width} and a height of ${canvasSize.height}`)
}

//skull
function makePromiseWithDelay(delay) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('Promise resolved after ' + delay + ' milliseconds');
      }, delay);
    });
  }

const textures = PIXI.Assets.load(["assets/rasei.png"])
    .then(loadSkin())
    .then(function(promise)
    {
        console.log("Textures Loaded");
        init();
    });

window.addEventListener("gamepadconnected", (e) => {
    controllerIndex = e.gamepad.index
    console.log(
        "Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index,
        e.gamepad.id,
        e.gamepad.buttons.length,
        e.gamepad.axes.length,
    );
});

function handleControllerInputs(index)
{
    if (controllerIndex !== null) 
    {
        const gamepad = navigator.getGamepads()[index];
        for (const [index, button] of Object.entries(gamepad.buttons)) 
        {
            if (button.pressed)
            {
                // console.log(button)
                // console.log(`button ${index} pressed`)
            }
        }
    }
}

// const misamino = new Worker("src/utils/bots/misaImport.js");
// misamino.onmessage = (message) => console.log(message.data);
