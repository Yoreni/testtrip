{
    const lineGoal = 100;
    const cheeseHeight = 10;
    const garbageMessiness = 100;

    const inComboMinCheeseHeight = Math.min(cheeseHeight, 3)

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

        if (garbageMessiness <= randInt(0, 99))
            return lastWellColumn;

        let chosen = randInt(0, 9);
        while (chosen === lastWellColumn)
            chosen = randInt(0, 9);

        lastWellColumn = chosen;
        return lastWellColumn;
    }

    const replaceGarbage = function(player, amount)
    {
        for (let index = 0; index != amount; ++index)
        {
            addGarbage(player.board, newWellColumn(), 1);
            ++currentCheeseHeight;
        }
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
                if (statName === "Garbage Left")
                    return Math.max(lineGoal - garbageCleared, 0)
                if (statName === "Pace")
                    return Math.round((this._logicPlayer.piecesPlaced / garbageCleared) * lineGoal);
                return super.getPlayerStat(statName)
            }

            _updateStats()
            {
                //console.log(PlayerRenderer.InfoDisplay)
                let display = ["PPS", "Time", "Garbage Left", "Pieces", "Pace"];
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
                replaceGarbage(e.player, Math.min(cheeseHeight, lineGoal));
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

                if (garbageCleared >= lineGoal)
                    e.player._markTopout();
            });

            eventManager.addEvent("onPiecePlace", (e) =>
            {
                //replace garbage lines
                const garbageLeftToSpawn = Math.max(lineGoal - currentCheeseHeight - garbageCleared, 0);
                let replaceAmount = Math.max(Math.min(garbageLeftToSpawn, cheeseHeight - currentCheeseHeight), 0);

                //dont replace garbage lines if we are in a combo
                if (e.player.combo > 0)
                {
                    replaceAmount = Math.max(Math.min(replaceAmount, 
                            inComboMinCheeseHeight - currentCheeseHeight), 0);
                }

                replaceGarbage(e.player, replaceAmount);
            });
        },
        gameRules:
        {
            seed: 10
        }
    });
}
