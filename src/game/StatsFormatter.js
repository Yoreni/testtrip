class StatsFormatter
{
    /**
     * @type {Object{string: function(Player) : string}}
     */
    static #FORMATTED_STATS = {
        "PPS": (player) => player.pps.toFixed(2),
        "time": (player) => mss000timeformat(player.time),
        "pieces": (player) => player.piecesPlaced,
        "lines": (player) => player.linesCleared,
    }

    /**
     * 
     * gets a human readble format of a stat releated to a player
     * 
     * @param {string} statName
     * @param {PlayerLogic} player 
     */
    static getPlayerStat(statName, player)
    {
        const func = StatsFormatter.#FORMATTED_STATS[statName];
        return func(player) ?? "undefined";
    }

    static addStat(statName, func)
    {
        StatsFormatter.#FORMATTED_STATS[statName] = func;
    }
}