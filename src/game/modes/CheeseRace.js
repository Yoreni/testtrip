{
    const lineGoal = 20;

    let lastWellColumn = null

    const newWellColumn = function()
    {
        if (lastWellColumn === null)
        {
            lastWellColumn = randInt(0, 9);
            return lastWellColumn;
        }

        let chosen = randInt(0, 9);
        while (chosen === lastWellColumn)
            chosen = randInt(0, 9);

        lastWellColumn = chosen;
        return lastWellColumn;
    }

    modeManager.register("cheeseRace",
    {
        render: class extends PlayerRenderer
        {
            getPlayerStat(statName)
            {
                return super.getPlayerStat(statName)
            }

            _updateStats()
            {
                //console.log(PlayerRenderer.InfoDisplay)
                let display = ["PPS", "Time"];
                super._updateStats(display);
            }
        },
        logic: class extends Player
        {
            tick(delta)
            {
                super.tick(delta);
            }
        },
        events: () =>
        {
            eventManager.addEvent("onGameStart", (e) =>
            {
                for(let count = 0; count != 10; ++count)
                {
                    addGarbage(e.player.board, newWellColumn(), 1);
                }
                //e.render._drawBoard(e.player.board);
            });
        },
    });
}
