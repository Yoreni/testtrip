{
    const onPieceLock = (e) =>
    {
        const logicPlayer = e.player.logic;

        // the b2b counter is unchanged if we dont clear any lines
        if (e.clearedLines == 0)
            return;

        if (e.clearedLines >= 4 || e.spinType != SpinType.NONE)
            ++(logicPlayer.stats.b2b);
        else
            logicPlayer.stats.b2b = 0;
    };

    const addon =
    {
        onAdd: () =>
        {

        },
        events:
        {
            onPieceLock,
            onGameStart: (e) => e.player.logic.stats.b2b = 0,
        }
    }

    addonMangaer.register("backToBack", addon)
}