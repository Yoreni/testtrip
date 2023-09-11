class ModeMenu extends IScene
{
    constructor()
    {
        super();
        this.container = new PIXI.Container();
        this._objects = {};

        this._objects.button = new Button("Play");
        this._objects.button.position.set(100, 100);
        this._objects.button.onClick = () => sceneManager.start("game");

        this.container.addChild(this._objects.button)
    }

    start()
    {
        this.container.visible = true;
    }

    stop()
    {
        this.container.visible = false;
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