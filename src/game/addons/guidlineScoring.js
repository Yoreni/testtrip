{
    //TODO
    // - add B2B points
    // - add softdrop and harddrop points

    const normalLineClears = [0, 100, 300, 500, 800];
    const miniSpinClears = [100, 200, 400, 600, 800];
    const spinClears = [400, 800, 1200, 1600, 2000];
    const perfectClearAmount = 3500;

    addonMangaer.register("guidlineScoring", () =>
    {
        eventManager.addEvent("onGameStart", (e) => e.player.score = 0);

        eventManager.addEvent("onPieceLock", (e) =>
        {
            if (e.clearedLines > 4)
                return;

            if (e.spinType === 0)
                e.player.score += normalLineClears[e.clearedLines];
            if (e.spinType === 1)
                e.player.score += miniSpinClears[e.clearedLines];
            if (e.spinType === 2)
                e.player.score += spinClears[e.clearedLines];

            //combo points
            if(e.player.combo > 0)
                e.player.score += 50 * (e.player.combo - 1);
            
            console.log(e.player.score)
        });

        eventManager.addEvent("onPiecePlace", (e) =>
        {
            if (e.player.board.isPc)
                e.player.score += perfectClearAmount;
        });
    })
}