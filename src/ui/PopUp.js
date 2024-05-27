class PopUp extends PIXI.Container
{
    constructor()
    {
        super()
        this.visible = false;

        let box = new PIXI.Graphics()
        box.lineStyle(8,0x000000,1)
        box.beginFill(0xDDDDDD)
        box.drawRoundedRect(0, 0, 256, 256, 10)
        box.endFill()
        this.addChild(box)

        let closeButton = new Button("X", {
            onClick: () => this.close()
        });
        closeButton.x = box.width;
        this.addChild(closeButton);

        this._addContent();
    }

    _addContent()
    {

    }

    open()
    {
        this.visible = true; 
    }

    close()
    {
        this.visible = false; 
    }
}