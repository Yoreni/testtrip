{
    let timeLimit = 120;

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
        logic: class extends PlayerLogic
        {
            tick(delta)
            {
                if (this.time >= timeLimit && this.isAlive)
                {
                    alert(this.score.toLocaleString())
                    this._markTopout();
                }
                super.tick(delta);
            }
        },
        events: 
        {
            onScoreChange: (e) =>
            {
                const pos = Point((e.piece.x - 1) * 16, (e.piece.y + 1) * -16)
                new NumberPopup(e.player.render.container, e.change, pos);
            }
        },
        init: (rules) =>
        {
        },
        load: (modeOptions) => 
        {
            timeLimit = modeOptions.timeLimit ?? 120
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
            this.count = 0;
        }

        update(delta)
        {
            if (this.text.alpha > 0)
            {
                this.text.alpha -= 0.01;
                this.text.style.fill = this.count % 8 < 4 ? 
                    "#AAAAAA" : "#888888";
            }
            else
                app.ticker.remove(this.tickerFunction)
            ++(this.count)
        }
    }
}
