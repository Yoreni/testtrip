function sevenBag(currentQueue, pieceRoster)
{
    let bag = deepCopy(pieceRoster)
    shuffle(bag);
    return bag;
}

function fourteenBag(currentQueue, pieceRoster)
{
    let bag = deepCopy(pieceRoster).concat(deepCopy(pieceRoster))
    shuffle(bag);
    return bag;
}