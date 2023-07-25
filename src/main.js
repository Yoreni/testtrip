"use strict";
let canvasSize = {width: 0, height: 0}

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

function init() 
{
    resize();
    app.ticker.maxFPS = 60

    // load assets and fonts
    document.body.appendChild(app.view);
    app.renderer.view.style.position = 'absolute'
    
    //setup scene manager
    const sceneManager = new SceneManager(app);

    sceneManager.add("game", new Game())
    sceneManager.start("game")

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

/**
 * 
 * @param {Player} player 
 */
function test(player)
{
    player.holdPiece
}

const textures = PIXI.Assets.load(["assets/rasei.png"])
    .then(function()
    {
        //loads a skin
        return readZip(new ZipReader(new HttpReader("/assets/tetrazz3.zip")))
    })
    .then(function(data)
    {
        let [skinData, urls] = data;
        let skin = new Skin(skinData, urls);
        return skin.loadTextures();
    })
    .then(function(promise)
    {
        console.log("Textures Loaded");
        init();
    });