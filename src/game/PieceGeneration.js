function sevenBag(player)
{
    let bag = deepCopy(player.rules.pieceRoster)
    shuffle(bag, player.random);
    return bag;
}

function fourteenBag(player)
{
    let bag = deepCopy(player.rules.pieceRoster).concat(deepCopy(player.rules.pieceRoster))
    shuffle(bag, player.random);
    return bag;
}

function tonly(player)
{
    return ["T"]
}