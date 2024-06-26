"use strict";
let canvasSize = {width: 0, height: 0}

let misaminoPoint = undefined;

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

PIXI.Assets.load(["assets/rasei.png"])
    .then(async () =>
    {
        await loadSkin();
        await langManager.fetchStrings();
        await loadModes();
        await init();
    });


const modes = ["C4WCombos", "CheeseRace", "DevMode", "Marathon", "Sprint", "TetaminoArt", "Ultra", "Versus"];

async function loadModes()
{
    for (let mode of modes)
        await loadJavascript(`src/game/modes/${mode}.js`);
}


async function init() 
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
    sceneManager.add("results", new ResultsScreen())
    sceneManager.start("modeMenu")
    console.log("scenes started")

    setup();
}

function setup() 
{
    let debugMenu = new DebugMenu(app)
    app.stage.addChild(debugMenu.container)

    app.ticker.add((delta) => {
        stats.begin();
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

// const misamino = new Worker("src/utils/bots/misaImport.js");
// misamino.onmessage = (message) => console.log(message.data);
