{
    let lineGoal = 40;

    modeManager.register("sprint",
    {
        render: class extends PlayerRenderer
        {
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
                if (e.player.logic.linesCleared >= lineGoal)
                    e.player.logic.endGame();
            }
        },
        load: (modeOptions, rules) => 
        {
            lineGoal = modeOptions.lineGoal ?? lineGoal

            PlayerRenderer.addStat("linesRemaining", (player) => Math.max(lineGoal - player.linesCleared, 0));

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
        },
        addons: ["advancedPpsTracker"]
    });
}
