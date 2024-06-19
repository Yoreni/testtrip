{
    let lineGoal = 40;

    let lppstracker = []

    modeManager.register("sprint",
    {
        render: class extends PlayerRenderer
        {
            getPlayerStat(statName)
            {
                if (statName === "linesRemaining")
                    return Math.max(lineGoal - this._logicPlayer.linesCleared, 0);
                if (statName === "lPPS")
                    return  lppstracker.length <= 1 ? "0.00" : 
                        (lppstracker.length / (lppstracker[0] - lppstracker.at(-1))).toFixed(2);
                return super.getPlayerStat(statName)
            }

            _updateStats()
            {
                let display = ["PPS", "time", "linesRemaining", "lPPS"];
                super._updateStats(display);
            }

            update(delta)
            {
                if (this.count === undefined)
                {
                    this.count = 0;
                    this.container.rotation = 0;
                }
                super.update(delta);
                // //this.container.pivot.set(this.container.width * 0.5, this.container.height * -0.5);
                // if (this.count % 60 === 0)
                //     //this.container.skew.set(this.container.skew.x + 0.01, this.container.skew.y + 0.01)
                //     this.container.angle += 90
                // console.log(`W:${this.container.width}, H:${this.container.height}, X:${this.container.x}, Y:${this.container.y}, pX:${this.container.pivot.x}, pY:${this.container.pivot.y}`)
                // ++(this.count);
            }
        },
        events: 
        {
            onPieceLock: (e) =>
            {
                lppstracker.unshift(new Date().getTime() / 1000)
                if (lppstracker.length > 5)
                    lppstracker.pop()

                if (e.player.logic.linesCleared >= lineGoal)
                {
                    e.player.logic.endGame();
                    // alert(`Pieces: ${e.player.logic.piecesPlaced}`)
                }
            }
        },
        load: (modeOptions, rules) => 
        {
            lineGoal = modeOptions.lineGoal ?? lineGoal

            PlayerRenderer.addStat("linesRemaining", (player) => Math.max(lineGoal - player.linesCleared, 0));
            PlayerRenderer.addStat("lPPS", (player) => lppstracker.length <= 1 ? "0.00" : 
                (lppstracker.length / (lppstracker[0] - lppstracker.at(-1))).toFixed(2))
        },
        config: {
            lineGoal: {
                type: ValueSelector,
                options: [1, 2, 4, 10, 20, 40, 100, 250, 500, 1000, 10_000]
                            .map(number => Option(langManager.formatNumber(number), number)),
                defaultIndex: 5,
                title: langManager.get("menu.modeSettings.lineGoal")
            }
        },
        result: {
            primary: "time",
            other: ["PPS", "pieces"],
        }
    });
}
