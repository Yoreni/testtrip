{
    modeManager.register("c4wcombos",
    {
        render: class extends PlayerRenderer
        {
            getPlayerStat(statName)
            {
                if (statName === "Combo")
                    return this._logicPlayer.combo;
                return super.getPlayerStat(statName)
            }

            _updateStats()
            {
                let display = ["PPS", "Time", "Combo"];
                super._updateStats(display);
            }
        },
        events: 
        {
            onGameStart: (e) =>
            {
                // plice intital garbage residue
                const board = e.player.logic.board
                board.set(0, 0, "#")
                board.set(0, 1, "#")
                board.set(1, 0, "#")
                e.player.render._drawBoard(board)
                e.player.render._drawGhostPiece()
            },
            onPieceLock: (e) =>
            {
                if (e.player.logic.piecesPlaced != e.player.logic.combo)
                {
                    e.player.logic._markTopout();
                    alert(`Combo: ${e.player.logic.combo}`)
                }
            }
        },
        gameRules: {
            board: {
                width: 4,
                height: 20
            },
            // pieceRoster: ["I"]
        },
        load: (modeOptions) => 
        {
            
        },
        addons: ["lineClearToasts"]
    });
}
