{
    modeManager.register("c4wcombos",
    {
        render: class extends PlayerRenderer
        {
            _updateStats()
            {
                let display = ["PPS", "time", "combo"];
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
                    e.player.logic.endGame();
                    alert(`Combo: ${e.player.logic.stats.highestCombo}`)
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
            PlayerRenderer.addStat("combo", (player) => player.combo)
        },
        addons: ["lineClearToasts"]
    });
}
