{
    const normalLineClears = [0, 100, 300, 500, 800];
    const miniSpinClears = [100, 200, 400, 600, 800];
    const spinClears = [400, 800, 1200, 1600, 2000];
    const perfectClearAmount = 3500;

    //used to keep track of the score keeping process for each player
    let changeTracker = {};

    const addon = 
    {
        onAdd: () =>
        {
            eventManager.addEvent("onGameStart", (e) => 
            {
                e.player.score = 0;
                if (e.player._rules.scoreMulti === undefined)
                    e.player._rules.scoreMulti = 1;
            });

            eventManager.addEvent("onPieceLock", (e) =>
            {
                if (e.clearedLines > 4)
                    return;

                let change = 0
    
                //get extra points for keeping a b2b
                const b2bMultiplyer = e.player._stats.b2b > 1 ? 1.5 : 1;
    
                if (e.spinType === 1 && e.piece.type == "T")    //t spin mini
                    change += miniSpinClears[e.clearedLines] * b2bMultiplyer;
                else if (e.spinType === 2 && e.piece.type == "T")   //normal t spin
                    change += spinClears[e.clearedLines] * b2bMultiplyer;
                else //usual line clears
                    change += normalLineClears[e.clearedLines] * b2bMultiplyer;
                //combo points
                if(e.player.combo > 0)
                    change += 50 * (e.player.combo - 1);

                change = Math.round(change * e.player._rules.scoreMulti)
                e.player.score += change
                if (change > 0)
                    e.change = change
                changeTracker[e.player.id] = e;
            });
    
            eventManager.addEvent("onPiecePlace", (e) =>
            {
                if (e.player.board.isPc)
                {
                    const pointsAwarded = Math.round(perfectClearAmount * e.player._rules.scoreMulti);
                    e.player.score += pointsAwarded;
                    changeTracker[e.player.id].change += pointsAwarded;
                }

                if (changeTracker[e.player.id].change > 0)
                    eventManager.callEvent("onScoreChange", changeTracker[e.player.id]);
            });
    
            eventManager.addEvent("onSoftDrop", (e) => e.player.score += e.distance);
    
            eventManager.addEvent("onHardDrop", (e) => e.player.score += e.distance * 2);
        },
        depend: ["backToBack"]
    }

    addonMangaer.register("guidlineScoring", addon);
}