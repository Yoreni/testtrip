{
    const normalLineClears = [0, 100, 300, 500, 800];
    const miniSpinClears = [100, 200, 400, 600, 800];
    const spinClears = [400, 800, 1200, 1600, 2000];
    const perfectClearAmount = 3500;

    //used to keep track of the score keeping process for each player
    let changeTracker = {};

    const onGameStart = (e) => 
    {
        const logicPlayer = e.player.logic;

        changeTracker = {}
        logicPlayer.score = 0;
        if (logicPlayer._rules.scoreMulti === undefined)
            logicPlayer._rules.scoreMulti = 1;
    }

    const onPieceLock = (e) =>
    {
        if (e.clearedLines > 4)
            return;

        let change = 0

        const logicPlayer = e.player.logic;
        //get extra points for keeping a b2b
        const b2bMultiplyer = logicPlayer._stats.b2b > 1 ? 1.5 : 1;

        if (e.spinType === SpinType.MINI && e.piece.type == "T")    //t spin mini
            change += miniSpinClears[e.clearedLines] * b2bMultiplyer;
        else if (e.spinType === SpinType.FULL && e.piece.type == "T")   //normal t spin
            change += spinClears[e.clearedLines] * b2bMultiplyer;
        else //usual line clears
            change += normalLineClears[e.clearedLines] * b2bMultiplyer;

        //combo points
        if(logicPlayer.combo > 0)
            change += 50 * (logicPlayer.combo - 1);

        change = Math.round(change * logicPlayer._rules.scoreMulti)
        logicPlayer.score += change
        if (change > 0)
            e.change = change
        changeTracker[logicPlayer.id] = e;
    }

    const onPiecePlace = (e) =>
    {
        const logicPlayer = e.player.logic;

        if (logicPlayer.board.isPc)
        {
            const pointsAwarded = Math.round(perfectClearAmount * logicPlayer._rules.scoreMulti);
            logicPlayer.score += pointsAwarded;
            changeTracker[logicPlayer.id].change += pointsAwarded;
        }

        if (changeTracker[logicPlayer.id].change > 0)
            eventManager.callEvent("onScoreChange", changeTracker[logicPlayer.id]);
    }

    const addon = 
    {
        onAdd: () =>
        {    

        },
        events:
        {
            onGameStart,
            onPieceLock,
            onPiecePlace,
            onSoftDrop: (e) => e.player.logic.score += e.distance,
            onHardDrop: (e) => e.player.logic.score += e.distance * 2
        },
        depend: ["backToBack"]
    }

    addonMangaer.register("guidlineScoring", addon);
}