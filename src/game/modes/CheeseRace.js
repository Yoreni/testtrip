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

    /**
     * 
     * @param {Playfield} board 
     * @returns {Number} a number >0
     */
    const countClearedGarbage = function(board)
    {
        let count = 0;
        for (let line of board.completedLines)
        {
                //if the line is a garbageLine
                if (board.get(0, line) === "#" || board.get(1, line) === "#")
                    ++count;  
        }

        return count;
    }

    /**
     * Gets the amount of garbage that we should add to the player
     * 
     * @param {PlayerLogic} logicPlayer
     * @returns {Number} a number >0
     */
    const calcGarbageToReplace = function(logicPlayer)
    {
        const garbageLeftToSpawn = Math.max(lineGoal - logicPlayer.currentCheeseHeight - logicPlayer.garbageCleared, 0);
        let replaceAmount = clamp(garbageLeftToSpawn, 0, cheeseHeight - logicPlayer.currentCheeseHeight);

        //dont replace garbage lines if we are in a combo
        if (logicPlayer.combo > 0)
        {
            replaceAmount = clamp(replaceAmount, inComboMinCheeseHeight - logicPlayer.currentCheeseHeight, 0);
            replaceAmount = Math.min(replaceAmount, garbageLeftToSpawn)
        }

        return replaceAmount;
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

                const garbageCleard = countClearedGarbage(e.oldBoard);
                logicPlayer.garbageCleared += garbageCleard;
                logicPlayer.currentCheeseHeight -= garbageCleard;

                if (logicPlayer.garbageCleared >= lineGoal)
                    logicPlayer.endGame();

                const replaceAmount = calcGarbageToReplace(logicPlayer);
                replaceGarbage(logicPlayer, replaceAmount);
                e.player.render._drawBoard(logicPlayer.board);
                e.player.render._drawGhostPiece();
            }
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
        addons: ["lineClearToasts"],
        config: {
            lineGoal: {
                type: ValueSelector,
                options: [Option(1), Option(2), Option(3), Option(4), Option(5), Option(6), Option(8), Option(10), Option(12), Option(14), Option(16)
                    , Option(18), Option(20), Option(30), Option(40), Option(50), Option(100), Option(200), Option(300), Option(400)
                ],
                defaultIndex: 16,
                title: "Line Goal"
            },
            cheeseHeight: {
                type: Slider,
                min: 1,
                max: 20,
                default: 10,
                label: "Cheese Height"
            },
            garbageMessiness: {
                type: Slider,
                min: 0,
                max: 100,
                default: 100,
                valueDisplay: (value) => `${value}%`,
                label: "Garbage Messiness"
            }
        }
    });
}
