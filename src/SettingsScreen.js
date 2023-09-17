class SettingsScreen extends IScene
{
    constructor()
    {
        super();

        this.container = new PIXI.Container();
        this._objects = {};

        this._objects.back = new Button("Back", {colour: 0xFF5959});
        this._objects.back.position.set(8, app.view.height - this._objects.back.height - 5);
        this._objects.back.onClick = () => sceneManager.start("modeMenu");
        this.container.addChild(this._objects.back)
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