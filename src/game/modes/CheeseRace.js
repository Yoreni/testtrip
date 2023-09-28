{
    const lineGoal = 100;
    const cheeseHeight = 10;
    const garbageMessiness = 100;

    const inComboMinCheeseHeight = Math.min(cheeseHeight, 3)

    const newWellColumn = function(lastWellColumn)
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
            player.lastWellColumn = newWellColumn(player.lastWellColumn)
            addGarbage(player.board, player.lastWellColumn, 1);
            ++player.currentCheeseHeight;
        }
    }

    modeManager.register("cheeseRace",
    {
        render: class extends PlayerRenderer
        {
            getPlayerStat(statName)
            {
                if (statName === "Garbage Cleared")
                    return this._logicPlayer.garbageCleared
                if (statName === "Garbage Left")
                    return Math.max(lineGoal - this._logicPlayer.garbageCleared, 0)
                if (statName === "Pace")
                    return Math.round((this._logicPlayer.piecesPlaced / this._logicPlayer.garbageCleared) * lineGoal);
                return super.getPlayerStat(statName)
            }

            _updateStats()
            {
                let display = ["PPS", "Time", "Garbage Left", "Pieces", "Pace"];
                super._updateStats(display);
            }
        },
        events: 
        {
            onGameStart: (e) =>
            {
                //resets the varibles when the player restarts the game
                e.player.lastWellColumn = null;
                e.player.garbageCleared = 0;
                e.player.currentCheeseHeight = 0;

                replaceGarbage(e.player, Math.min(cheeseHeight, lineGoal));

                e.render._drawBoard(e.player.board);
                e.render._drawGhostPiece();
            },
            onPieceLock: (e) =>
            {
                for (let line of e.oldBoard.completedLines)
                {
                    //if the line is a garbageLine
                    if (e.oldBoard.get(0, line) === "#" || e.oldBoard.get(1, line) === "#")
                    {
                        ++(e.player.garbageCleared);
                        --(e.player.currentCheeseHeight);    
                    }

                    console.log(e.player.garbageCleared, e.player.currentCheeseHeight)
                }

                if (e.player.garbageCleared >= lineGoal)
                    e.player._markTopout();
            },
            onPiecePlace: (e) =>
            {
                //replace garbage lines
                const garbageLeftToSpawn = Math.max(lineGoal - e.player.currentCheeseHeight - e.player.garbageCleared, 0);
                let replaceAmount = clamp(garbageLeftToSpawn, 0, cheeseHeight - e.player.currentCheeseHeight);

                //dont replace garbage lines if we are in a combo
                if (e.player.combo > 0)
                    replaceAmount = clamp(replaceAmount, inComboMinCheeseHeight - e.player.currentCheeseHeight, 0);

                console.log(replaceAmount)    
                replaceGarbage(e.player, replaceAmount);
                e.render._drawBoard(e.player.board);
                e.render._drawGhostPiece();
            }
        },
        gameRules:
        {
            seed: 10
        }
    });
}
