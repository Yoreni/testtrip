{
    addonMangaer.register("backToBack", () =>
    {
        eventManager.addEvent("onGameStart", (e) => e.player._stats.b2b = 0);

        eventManager.addEvent("onPieceLock", (e) =>
        {
            // the b2b counter is unchanged if we dont clear any lines
            if (e.clearedLines == 0)
                return;

            if (e.clearedLines >= 4 || e.spinType > 0)
                ++(e.player._stats.b2b);
            else
                e.player._stats.b2b = 0;
            
            console.log("b2b", e.player._stats.b2b)
        });
    })
}