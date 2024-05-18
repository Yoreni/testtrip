{
    let startingLevel = 1;

    const gravitys = [0.01667, 0.021017, 0.026977, 0.035256, 0.04693,
                      0.06361, 0.0879  , 0.1236  , 0.1775  , 0.2598,
                      0.388  , 0.59    , 0.92    , 1.46    , 2.36,
                      3.91   , 6.61    , 11.43   , 20      , 20,
                      20     , 20      , 20      , 20      , 20,
                      20     , 20      , 20      , 20      , 20,
                      20     , 20      , 20      , 20      , 20,
                      20     , 20      , 20      , 20      , 20]

    const lockDelays = [30, 30, 30, 30, 30,
                        30, 30, 30, 30, 30,
                        30, 30, 30, 30, 30,
                        30, 30, 30, 30, 30,
                        28, 26, 24, 20, 18,
                        16, 14, 13, 12, 11,
                        10,  9,  8,  7,  6,
                         5,  4,  3,  2,  1]

    modeManager.register("marathon",
    {
        render: class extends PlayerRenderer
        {
            getPlayerStat(statName)
            {
                if (statName === "score")
                    return this._logicPlayer.score.toLocaleString()
                if (statName === "level")
                    return this._logicPlayer.level;
                return super.getPlayerStat(statName)
            }

            _updateStats()
            {
                let display = ["lines", "time", "score", "level"];
                super._updateStats(display);
            }
        },
        events: 
        {
            onGameStart: (e) =>
            {
                const logicPlayer = e.player.logic;
                
                logicPlayer.level = startingLevel;
                logicPlayer._rules.gravitiy = gravitys[startingLevel - 1];
                logicPlayer._rules.lockDelay = lockDelays[startingLevel - 1];
                logicPlayer._rules.scoreMulti = startingLevel;
            },
            onScoreChange: (e) =>
            {
                const pos = Point((e.piece.x - 1) * 16, (e.piece.y + 1) * -16)
                new NumberPopup(e.player.render.container, e.change.toLocaleString(), pos);
            },
            onPiecePlace: (e) =>
            {
                const logicPlayer = e.player.logic;
                const level = Math.floor(logicPlayer.linesCleared / 10) + startingLevel;

                if (level != logicPlayer.level)
                {
                    logicPlayer.level = level;
                    logicPlayer._rules.gravitiy = gravitys[level - 1];
                    logicPlayer._rules.lockDelay = lockDelays[level - 1];
                    logicPlayer._rules.scoreMulti = level;
                }
            }

        },
        gameRules: {
            hold: 1
        },
        load: (modeOptions) => 
        {
            startingLevel = modeOptions.startingLevel ?? startingLevel
        },
        addons: ["guidlineScoring","lineClearToasts"],
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
