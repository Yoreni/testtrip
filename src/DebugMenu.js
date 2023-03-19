let stats;

function DebugMenu(pixiApp)
{
    this.app = pixiApp
    this.container = new PIXI.Container()
    this.debug = false
    this.cursorPos = {x: 0, y: 0}

    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
    stats.hide() 

    const onDragEnd = (event, sprite) => {
        if(sprite.dragging)
        {    
            sprite.x = event.data.global.x;
            sprite.y = event.data.global.y;
            dragText.update()
            sprite.dragging = false;
        }
    }

    this.container.visible = false

    this.drag = new PIXI.Graphics()
    this.drag.beginFill(0x00000)
    this.drag.drawRect(0,0,20,20,10)
    this.drag.endFill()
    this.drag.position.set(100,100)
    this.drag.interactive = true

    this.drag.on('mousedown', (e) => {
        this.drag.x = e.data.global.x;
        this.drag.y = e.data.global.y;
        dragText.update()
        this.drag.dragging = true;
    });

    this.drag.on('mousemove',  (e) => {
        this.cursorPos.x = e.data.global.x
        this.cursorPos.y = e.data.global.y
        if (this.drag.dragging) {
            this.drag.x = e.data.global.x;
            this.drag.y = e.data.global.y;
            dragText.update()
        }
    });

    this.drag.on('mouseup', (e) => onDragEnd(e, this.drag));
    this.drag.on('mouseupoutside', (e) => onDragEnd(e, this.drag));
   // addDragAndDrop(this.drag)

    this.container.addChild(this.drag)

    let dragText = new PIXI.Text("",{fontSize: 24,fontWeight: "bold",fontFamily: "Calibri"})
    dragText.position.set(100,0)
    dragText.update = () => dragText.text = "X: " + this.drag.x.toFixed(0) + " Y: " + this.drag.y.toFixed(0)
    dragText.update()
    this.container.addChild(dragText)

    let cursorPosText = new PIXI.Text("",{fontSize: 24,fontWeight: "bold",fontFamily: "Calibri"})
    cursorPosText.position.set(260,0)
    cursorPosText.update = () => cursorPosText.text = "Cursor X: " + this.cursorPos.x.toFixed(0) + " Y: " + this.cursorPos.y.toFixed(0)
    cursorPosText.update()
    this.container.addChild(cursorPosText)

    this.FPStext = new PIXI.Text("",{fontSize: 24,fontWeight: "bold",fontFamily: "Calibri"})
    this.FPStext.position.set(490,0)
    this.container.addChild(this.FPStext)

    app.renderer.plugins.interaction.on('mousemove', (e) => cursorPosText.update())

    var onSpace = new KeyDetector(pixiApp, "F8")
    onSpace.onDown = () => 
    {
        if(onSpace.framesDown == 1)
        {
            if(this.debug)
            {
                this.hide()
            }
            else
            {
                this.show()
            }
        }   
    }

    app.ticker.add(this.update.bind(this))
}

DebugMenu.prototype.show = function() 
{
    this.debug = true
    this.container.visible = true
    stats.show()
}

DebugMenu.prototype.hide = function()
{
    this.debug = false
    this.container.visible = false
    stats.hide()
    this.drag.dragging = false;
}

DebugMenu.prototype.update = function(delta) 
{
    this.FPStext.text = this.app.ticker.FPS.toFixed(0) + " FPS"
}