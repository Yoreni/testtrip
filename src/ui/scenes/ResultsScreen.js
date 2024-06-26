class ResultsScreen extends IScene
{
    #objects;
    #resultsDisplay;

    constructor() 
    {
        super();
        this.container = new PIXI.Container();
        this.#objects = {};
    }

    init()
    {
        this.#objects.otherTexts = [];

        this.#makeButtons();
        this.#makeText();
    }

    start()
    {
        this.resetKey = new KeyDetector(controls.reset);
        this.quitKey = new KeyDetector(controls.quit);
        this.container.visible = true;

        this.#resultsDisplay = modeManager.getResultsDisplay(selectedMode);

        if (this.#resultsDisplay === undefined)
        {
            this.#objects.scoreText.text = "";
            return;
        }
        const stat = this.#getStat(gameResult, this.#resultsDisplay.primary);
        this.#objects.scoreText.text = `${stat.name}: ${stat.value}`;

        this.#makeOtherText();

        //line chart test
        try
        {
        this.#objects.ppsChart = new LineChart({
            type: 'line',
            data: {
                labels: gameResult.stats.lockLog.map(mss000timeformat),
                datasets: [{
                  label: 'lPPS',
                  data: gameResult.stats.lppsLog,
                  fill: false,
                  borderWidth: 3
                }]
            },
            options: {
              responsive: false,
              scales: {
                x: {
                  beginAtZero: true,
                //   ticks: {
                //     callback: function(value, index, ticks) { console.log(value); console.log(index); console.log(ticks); return value }
                //   }
                }
              }
            },
            plugins: {
                decimation: {
                    enabled: true,
                    algorithm: 'min-max',
                },
            },
        })
        this.#objects.ppsChart.position.set(200, 200)
        this.container.addChild(this.#objects.ppsChart);
        }
        catch (exception)
        {

        }
    }

    stop()
    {
        this.container.visible = false;
    }

    update(delta)
    {
        if (this.quitKey.isDown)
            sceneManager.start("modeMenu");
        else if (this.resetKey.isDown)
            sceneManager.start("game");
    }

    destory()
    {

    }

    #makeOtherText()
    {
        const stats = this.#resultsDisplay.other ?? [];

        for (let index = 0; index != Math.max(stats.length, this.#objects.otherTexts.length); ++index)
        {
            if (index < stats.length)
            {
                // if text object doesnt exist but needed
                if (index === this.#objects.otherTexts.length)
                {
                    this.#objects.otherTexts.push(new PIXI.Text("", textStyle(24)));
                    this.#objects.otherTexts[index].position.set(app.view.width / 2, 80 + (index * 20));
                    this.container.addChild(this.#objects.otherTexts[index]);
                }
                
                //if text object already exists
                const stat = this.#getStat(gameResult, stats[index])
                this.#objects.otherTexts[index].visible = true;
                this.#objects.otherTexts[index].text = `${stat.name}: ${stat.value}`;
            }
            else
            {
                //if text object exists but isnt needed
                this.#objects.otherTexts[index].visible = false;
            }
        }
    }

    #makeText()
    {
        this.#objects.scoreText = new PIXI.Text("", textStyle(36));
        this.#objects.scoreText.position.set(app.view.width / 2, 30);
        this.container.addChild(this.#objects.scoreText);
    }

    #makeButtons()
    {
        this.#objects.back = new Button(langManager.get("back"), {colour: 0xFF5959});
        this.#objects.back.position.set(app.view.width / 2, app.view.height - this.#objects.back.height - 5);
        this.#objects.back.onClick = () => sceneManager.start("modeMenu");
        this.container.addChild(this.#objects.back)
    }

    /**
     * 
     * @param {PlayerLogic} player 
     * @param {string | object} stat 
     * @returns {object}
     */
    #getStat(player, stat)
    {
        if (typeof stat == "string")
        {
            return {
                value: StatsFormatter.getPlayerStat(stat, player),
                name: langManager.get("gameHud.stats." + stat)
            }
        }
        else if (typeof stat == "object")
        {
            return {
                value: StatsFormatter.getPlayerStat(stat.stat, player),
                name: langManager.get(stat.localKey)
            }
        }
        throw TypeError("stat given is not of an regignosable type " + stat)
    }
}