{
    const lineGoal = 40; 

    modeManager.register("sprint",
    {
        render: class extends PlayerRenderer
        {
            
            getPlayerStat(statName)
            {
                if (statName === "Lines Remaining")
                    return Math.max(lineGoal - this._logicPlayer.linesCleared, 0);
                return super.getPlayerStat(statName)
            }

            _updateStats()
            {
                let display = ["PPS", "Time", "Lines Remaining"];
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
        events: () =>
        {
            eventManager.addEvent("onPieceLock", (e) =>
            {
                if (e.player.linesCleared >= lineGoal)
                {
                    e.player._markTopout();
                    alert(`Pieces: ${e.player.piecesPlaced}`)
                }
            })
        },
        addons: ["guidlineScoring"]
    });
}
