// class Sprint
// {
//     constructor()
//     {

//     }

//     class Inner
//     {

//     }
// }

const sprintUtils = {
    test: () => console.log("test")
}

const sprint = 
{
    // logic: class 
    // {

    // }
    render: class extends PlayerRenderer
    {
        
        getPlayerStat(statName)
        {
            if (statName === "Lines Remaining")
                return Math.max(40 - this._logicPlayer.linesCleared, 0);
            return super.getPlayerStat(statName)
        }
        _updateStats()
        {
            let display = ["PPS", "Time", "Lines Remaining"];
            super._updateStats(display);
        }
    },
    events: () =>
    {
        eventManager.addEvent("onPieceLock", (e) =>
        {
            sprintUtils.test();
            if (e.player.linesCleared >= 40)
            {
                e.player._markTopout();
                alert(`Pieces: ${e.player.piecesPlaced}`)
            }
        })
    },
}
