const SRSkicktable = {  //this could be simplified
    "*": {
        "01": [Point(0, 0), Point(-1, 0), Point(-1, 1), Point(0, -2), Point(-1, -2)],
        "10": [Point(0, 0), Point(1, 0), Point(1, -1), Point(0, 2), Point(1, 2)],
        "12": [Point(0, 0), Point(1, 0), Point(1, -1), Point(0, 2), Point(1, 2)],
        "21": [Point(0, 0), Point(-1, 0), Point(-1, 1), Point(0, -2), Point(-1, -2)],
        "23": [Point(0, 0), Point(1, 0), Point(1, 1), Point(0, -2), Point(1, -2)],
        "32": [Point(0, 0), Point(-1, 0), Point(-1, -1), Point(0, 2), Point(-1, 2)],
        "30": [Point(0, 0), Point(-1, 0), Point(-1, -1), Point(0, 2), Point(-1, 2)],
        "03": [Point(0, 0), Point(1, 0), Point(1, 1), Point(0, -2), Point(1, -2)],
    },
    "I": {
        "01": [Point(0, 0), Point(-2, 0), Point(1, 0), Point(-2, -1), Point(1, 2)],
        "10": [Point(0, 0), Point(2, 0), Point(-1, 0), Point(2, 1), Point(-1, -2)],
        "12": [Point(0, 0), Point(-1, 0), Point(2, 0), Point(-1, 2), Point(2, -1)],
        "21": [Point(0, 0), Point(1, 0), Point(-2, 0), Point(1, -2), Point(-2, 1)],
        "23": [Point(0, 0), Point(2, 0), Point(-1, 0), Point(2, 1), Point(-1, -2)],
        "32": [Point(0, 0), Point(-2, 0), Point(1, 0), Point(-2, -1), Point(1, 2)],
        "30": [Point(0, 0), Point(1, 0), Point(-2, 0), Point(1, -2), Point(-2, 1)],
        "03": [Point(0, 0), Point(-1, 0), Point(2, 0), Point(-1, 2), Point(2, -1)],
    }
}

function SRS(direction, fallingPiece, playfield)
{
    const kicktableType = fallingPiece.type === "I" ? "I" : "*";
    const kicktableDirection = fallingPiece.rotation + "" + mod(fallingPiece.rotation + direction, 4);
    const kickData = SRSkicktable[kicktableType][kicktableDirection];

    for (let attempt = 0; attempt != kickData.length; ++attempt)
    {
        let piece = fallingPiece.copy();
        piece.rotate(direction);
        piece.x += kickData[attempt].x;
        piece.y += kickData[attempt].y;

        if (!playfield.doesColide(piece))
        {
            console.log(attempt);
            return piece;
        }
    }

    return fallingPiece;
}