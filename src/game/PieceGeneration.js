function sevenBag(currentQueue)
{
    let bag = Object.keys(pieces);
    shuffle(bag);
    return bag;
}

function fourteenBag(currentQueue)
{
    let bag = Object.keys(pieces).concat(Object.keys(pieces));
    shuffle(bag);
    return bag;
}