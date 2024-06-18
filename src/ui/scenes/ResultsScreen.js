class ResultsScreen extends IScene
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
        this.#makeButtons();
    }

    start()
    {
        this.container.visible = true;

        const resultDisplay = modeManager.getResultsDisplay(selectedMode);

        this.#objects.scoreText.text = `Time: ${mss000timeformat(gameResult.time)}`;
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

    #makeButtons()
    {
        this.#objects.back = new Button(langManager.get("back"), {colour: 0xFF5959});
        this.#objects.back.position.set(app.view.width / 2, app.view.height - this.#objects.back.height - 5);
        this.#objects.back.onClick = () => sceneManager.start("modeMenu");
        this.container.addChild(this.#objects.back)

        this.#objects.scoreText = new PIXI.Text("", textStyle());
        this.#objects.scoreText.position.set(app.view.width / 2, 30);
        this.container.addChild(this.#objects.scoreText);

    }
}