{
    const attackTable = {
        "1line": 0,
        "2line": 1,
        "3line": 2,
        "4line": 4,
        "1lineTS": 2,
        "2lineTS": 4,
        "3lineTS": 6,
        "4lineTS": 8,
        "perfectClear": 10,
    }

    const comboTable = [0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4];

    const garbageCap = 6;

    modeManager.register("versus",
    {
        render: class extends PlayerRenderer
        {
            getPlayerStat(statName)
            {
                const apm = this._logicPlayer._stats.attack / this._logicPlayer.time * 60
                if (statName === "APM")
                    return apm.toFixed(apm < 10 ? 2 : apm < 100 ? 1 : 0);
                if (statName === "VS Score")
                    return  "Not implemented";
                if (statName === "Attack")
                    return  this._logicPlayer._stats.attack;
                return super.getPlayerStat(statName)
            }

            _updateStats()
            {
                let display = ["PPS", "Time", "APM", "VS Score", "Attack"];
                super._updateStats(display);
            }
        },
        events: 
        {
            onGameStart: (e) =>
            {
                // console.log(e.players)
                // console.log(e)
                e.player.otherPlayers = e.players.filter((player) => e.player.id !== player.logic.id)

                e.player._stats.attack = 0;
                e.player.garbageIncoming = 0;
            },
            onPieceLock: (e) =>
            {
                const completedLines = e.oldBoard.completedLines.length
                let linesToSend = 0;

                if (completedLines > 0)
                {
                    const query = completedLines + "line" + (e.spinType === SpinType.FULL ? "TS" : "");
                    linesToSend = attackTable[query] 
                        + comboTable[e.player.combo]        //combo bonus
                        + (e.player._stats.b2b > 1 ? 1 : 0) //b2b bonus

                    const target = e.player.otherPlayers[randInt(0, e.player.otherPlayers.length - 1)].logic
                    e.player._stats.attack += linesToSend;
                    target.garbageIncoming += linesToSend;
                }

                if (e.player.garbageIncoming > 0)
                {
                    const amountToAdd = Math.min(e.player.garbageIncoming, garbageCap)
                    e.player.garbageIncoming -= amountToAdd;
                    console.log(e.player.garbageIncoming)
                    addGarbage(e.player.board, randInt(0, e.player.board.width), amountToAdd)
                }
            }
        },
        addons: ["backToBack"],
    });
}
