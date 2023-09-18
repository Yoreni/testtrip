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

        this._objects.dasSlider = new Slider({width: 200, height: 20, label: "test"});
        this._objects.dasSlider.position.set(100, 100);
        this.container.addChild(this._objects.dasSlider)
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