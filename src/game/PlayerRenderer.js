class PlayerRenderer
{
    constructor(logicPlayer, pixiContainer)
    {
        this._logicPlayer = logicPlayer;
        this.container = pixiContainer;
        this._objects = {}

        this._objects.text = new PIXI.Text("", {fontSize: 24,fontWeight: "bold",fontFamily: "Calibri"});
        this._objects.text.position.set(10, 70);
        this.container.addChild(this._objects.text);
    }

    update(delta)
    {
        this._objects.text.text = this._logicPlayer.combo;
    }
}