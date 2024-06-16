class TemplateScreen extends IScene
{
    #objects;

    constructor() 
    {
        super();
        this.container = new PIXI.Container();
        this.#objects = {};
    }

    init()
    {

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
}