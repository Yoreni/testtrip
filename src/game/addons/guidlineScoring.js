{
    //TODO
    // - mulipliers

    const normalLineClears = [0, 100, 300, 500, 800];
    const miniSpinClears = [100, 200, 400, 600, 800];
    const spinClears = [400, 800, 1200, 1600, 2000];
    const perfectClearAmount = 3500;

    const addon = 
    {
        onAdd: () =>
        {
            eventManager.addEvent("onGameStart", (e) => e.player.score = 0);

            eventManager.addEvent("onPieceLock", (e) =>
            {
                if (e.clearedLines > 4)
                    return;
    
                //get extra points for keeping a b2b
                const b2bMultiplyer = e.player._stats.b2b > 1 ? 1.5 : 1;
    
                if (e.spinType === 0)
                    e.player.score += normalLineClears[e.clearedLines] * b2bMultiplyer;
                if (e.spinType === 1)
                    e.player.score += miniSpinClears[e.clearedLines] * b2bMultiplyer;
                if (e.spinType === 2)
                    e.player.score += spinClears[e.clearedLines] * b2bMultiplyer;
    
                //combo points
                if(e.player.combo > 0)
                    e.player.score += 50 * (e.player.combo - 1);
            });
    
            eventManager.addEvent("onPiecePlace", (e) =>
            {
                if (e.player.board.isPc)
                    e.player.score += perfectClearAmount;
            });
    
            eventManager.addEvent("onSoftDrop", (e) => e.player.score += e.distance);
    
            eventManager.addEvent("onHardDrop", (e) => e.player.score += e.distance * 2);
        },
        depend: ["backToBack"]
    }

    addonMangaer.register("guidlineScoring", addon);
}