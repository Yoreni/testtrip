class ModeMenu extends IScene
{
    constructor()
    {
        super();
        this.container = new PIXI.Container();
        this._objects = {};

        this._objects.button = new Button("Test");
        this._objects.button.position.set(100, 100);
        this._objects.button.onClick = () => console.log("Hi");

        this.container.addChild(this._objects.button)
    }

    start()
    {
        
    }

    stop()
    {

    }

    update(delta)
    {

    }

    destory()
    {

    }

    init()
    {

    }
}