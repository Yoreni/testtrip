{
    const LPPS_PERIOD_LENGTH = 5;

    const calculateLpps = (dropLog) =>
    {
        if (dropLog.length == 0)
            return 0;

        const lastElement = dropLog.length - 1
        const periodEnd = dropLog[lastElement]
        const periodStart = dropLog.length < LPPS_PERIOD_LENGTH ?
            0 : dropLog[lastElement - LPPS_PERIOD_LENGTH + 1]

        return LPPS_PERIOD_LENGTH / (periodEnd - periodStart);
    }

    const onPieceLock = (e) =>
    {
        const logicPlayer = e.player.logic;

        const gameStart =  logicPlayer.stats.start.getTime() / 1000;
        logicPlayer.stats.lockLog.push((new Date().getTime() / 1000) - gameStart);
        logicPlayer.stats.lppsLog.push(calculateLpps(logicPlayer.stats.lockLog))
    };

    const addon =
    {
        onAdd: () =>
        {
            StatsFormatter.addStat("lPPS", (player) => 
            {
                const lppsLog = player.stats.lppsLog;

                return lppsLog.length == 0 ? "0.00" : lppsLog.at(-1).toFixed(2);
            });
        },
        events:
        {
            onPieceLock,
            onGameStart: (e) => 
            {
                e.player.logic.stats.lockLog = []
                e.player.logic.stats.lppsLog = []
            },
        }
    }

    addonMangaer.register("advancedPpsTracker", addon)
}