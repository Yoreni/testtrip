{
    let lineGoal = 100;
    let cheeseHeight = 10;
    let garbageMessiness = 100;

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
            _updateStats()
            {
                let display = ["PPS", "time", "garbageLeft", "pieces", "pace"];
                super._updateStats(display);
            }
        },
        events: 
        {
            onGameStart: (e) =>
            {
                //resets the varibles when the player restarts the game
                e.player.logic.lastWellColumn = null;
                e.player.logic.garbageCleared = 0;
                e.player.logic.currentCheeseHeight = 0;

                replaceGarbage(e.player.logic, Math.min(cheeseHeight, lineGoal));

                e.player.render._drawBoard(e.player.logic.board);
                e.player.render._drawGhostPiece();
            },
            onPieceLock: (e) =>
            {
                const logicPlayer = e.player.logic;

                for (let line of e.oldBoard.completedLines)
                {
                    //if the line is a garbageLine
                    if (e.oldBoard.get(0, line) === "#" || e.oldBoard.get(1, line) === "#")
                    {
                        ++(logicPlayer.garbageCleared);
                        --(logicPlayer.currentCheeseHeight);    
                    }
                }

                if (logicPlayer.garbageCleared >= lineGoal)
                    logicPlayer.endGame();
            },
            onPiecePlace: (e) =>
            {
                const logicPlayer = e.player.logic;

                //replace garbage lines
                const garbageLeftToSpawn = Math.max(lineGoal - logicPlayer.currentCheeseHeight - logicPlayer.garbageCleared, 0);
                let replaceAmount = clamp(garbageLeftToSpawn, 0, cheeseHeight - logicPlayer.currentCheeseHeight);

                //dont replace garbage lines if we are in a combo
                if (logicPlayer.combo > 0)
                {
                    replaceAmount = clamp(replaceAmount, inComboMinCheeseHeight - logicPlayer.currentCheeseHeight, 0);
                    replaceAmount = Math.min(replaceAmount, garbageLeftToSpawn)
                }

                replaceGarbage(logicPlayer, replaceAmount);
                e.player.render._drawBoard(logicPlayer.board);
                e.player.render._drawGhostPiece();
            }
        },
        gameRules:
        {
            seed: 10
        },
        load: (modeOptions) => 
        {
            lineGoal = modeOptions.lineGoal ?? lineGoal
            cheeseHeight = modeOptions.cheeseHeight ?? cheeseHeight
            garbageMessiness = modeOptions.garbageMessiness ?? garbageMessiness

            PlayerRenderer.addStat("garbageCleared", (player) => player.garbageCleared)
            PlayerRenderer.addStat("garbageLeft", (player) => Math.max(lineGoal - player.garbageCleared, 0))
            PlayerRenderer.addStat("pace", (player) => Math.round((player.piecesPlaced / player.garbageCleared) * lineGoal))
        },
        addons: ["lineClearToasts"]
    });
}
