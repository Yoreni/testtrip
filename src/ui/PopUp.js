class PopUp extends PIXI.Container
{
    constructor()
    {
        super()

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
        this.addChild(closeButton)
    }

    close()
    {
        this.visible = false; 
    }
}