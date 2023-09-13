function sevenBag(player)
{
    let bag = deepCopy(player._rules.pieceRoster)
    shuffle(bag, player.random);
    return bag;
}

function fourteenBag(player)
{
    let bag = deepCopy(player._rules.pieceRoster).concat(deepCopy(player._rules.pieceRoster))
    shuffle(bag, player.random);
    return bag;
}

function tonly(player)
{
    return ["T"]
}