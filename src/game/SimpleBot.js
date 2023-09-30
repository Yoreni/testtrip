let testBoard = new Playfield(10, 20)
let piece = new FallingPiece("T")
piece.y = 20
piece.x = 5;

/**
 * hard drops a piece for bots
 * 
 * @param {Playfield} board 
 * @param {FallingPiece} piece 
 * @returns 
 */
function placePiece(board, piece)
{
    if (board.doesColide(piece))
        return null;

    while (!board.doesColide(piece))
        --(piece.y);
    ++(piece.y);

    for (const mino of piece.minos)
        board.set(mino.x, mino.y, piece.type)

    return board;
}

/**
 * 
 * @param {Playfield} board 
 * @param {FallingPiece} piece 
 */
function getPossibleMoves(board, piece)
{
    const ogrinalBoard = board;
    const ogrinalPiece = piece;
    let outcomes = []

    for (let column = 0; column != ogrinalBoard.width; ++column)
    {
        for (let rotation = 0; rotation != 4; ++rotation)
        {
            board = ogrinalBoard.copy();
            piece = ogrinalPiece.copy();
            piece.x = column;
            piece.rotate(rotation);
    
            board = placePiece(board, piece);
            if (board !== null)
                outcomes.push({
                    board: board,
                    x: piece.x,
                    y: piece.y,
                    rotation: piece.rotation,
                    type: piece.type,
            })
        }
    }

    return outcomes;
}
