{
    const timeLimit = 120; 

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

        },
        init: (rules) =>
        {
            // rules.gravitiy = 20;
            // rules.ARE = 10;
        },
        addons: ["guidlineScoring"],
    });
}
