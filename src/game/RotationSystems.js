const SRSkicktable = {
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

    
}