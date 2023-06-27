{
    const timeLimit = 120; 

    let oldScore = 0;

    modeManager.register("ultra",
    {
        render: class extends PlayerRenderer
        {
            getPlayerStat(statName)
            {
                if (statName === "Score")
                    return this._logicPlayer.score.toLocaleString()
                if (statName === "Time")
                    return mss000timeformat(Math.max(timeLimit - this._logicPlayer.time, 0))
                return super.getPlayerStat(statName)
            }

            _updateStats()
            {
                let display = ["PPS", "Time", "Score"];
                super._updateStats(display);
            }
        },
        logic: class extends Player
        {
            tick(delta)
            {
                if (this.time >= timeLimit && this.isAlive)
                    this._markTopout();
                super.tick(delta);
            }
        },
        events: () =>
        {
            eventManager.addEvent("onScoreChange", (e) =>
            {
                const pos = Point((e.piece.x - 1) * 16, (e.piece.y + 1) * -16)
                new NumberPopup(e.render.container, e.change, pos);
            });
        },
        init: (rules) =>
        {
            // rules.gravitiy = 20;
            // rules.ARE = 10;
        },
        addons: ["guidlineScoring"],
    });

    class NumberPopup
    {
        constructor(container, text, pos = Point(0, -150))
        {
            this.container = container
            this.text = new PIXI.Text(text, {fontSize: 24, fontWeight: "bold",fontFamily: "Calibri", "align": "right", fill: "#EEEEEE",})
            this.text.position.set(pos.x, pos.y);
            this.container.addChild(this.text)
            this.tickerFunction = this.update.bind(this)
            app.ticker.add(this.tickerFunction)
        }

        update(delta)
        {
            if (this.text.alpha > 0)
                this.text.alpha -= 0.01;
            else
                app.ticker.remove(this.tickerFunction)
        }
    }
}
