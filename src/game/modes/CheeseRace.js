{
    const lineGoal = 20;
    const cheeseHeight = 10;

    let lastWellColumn = null
    let garbageCleared = 0;
    let currentCheeseHeight = 0;

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

    const getLinesLeft = function()
    {
        return lineGoal - garbageCleared;
    }

    modeManager.register("cheeseRace",
    {
        render: class extends PlayerRenderer
        {
            getPlayerStat(statName)
            {
                if (statName === "Garbage Cleared")
                    return garbageCleared
                return super.getPlayerStat(statName)
            }

            _updateStats()
            {
                //console.log(PlayerRenderer.InfoDisplay)
                let display = ["PPS", "Time", "Garbage Cleared"];
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
                for(let count = 0; count != cheeseHeight; ++count)
                {
                    addGarbage(e.player.board, newWellColumn(), 1);
                    ++currentCheeseHeight;
                }
            });

            eventManager.addEvent("onPieceLock", (e) =>
            {
                for (let line of e.oldBoard.completedLines)
                {
                    //if the line is a garbageLine
                    if (e.oldBoard.get(0, line) === "#" || e.oldBoard.get(1, line) === "#")
                    {
                        ++garbageCleared;
                        --currentCheeseHeight;    
                    }
                }


                if (garbageCleared + cheeseHeight > lineGoal)
                    return

                //replace garbage lines
                let replaceAmount = Math.min(getLinesLeft(), cheeseHeight - currentCheeseHeight);

                //dont replace garbage lines if we are in a combo
                if (e.player.combo > 0)
                {


                    replaceAmount = Math.max(Math.min(replaceAmount, 3 - currentCheeseHeight), 0);
                    for (let index = 0; index != replaceAmount; ++index)
                    {
                        addGarbage(e.player.board, newWellColumn(), 1);
                        ++currentCheeseHeight;
                    }
                    return;
                }

                for (let index = 0; index != replaceAmount; ++index)
                {
                    addGarbage(e.player.board, newWellColumn(), 1);
                    ++currentCheeseHeight;
                }
            });
        },
    });
}
