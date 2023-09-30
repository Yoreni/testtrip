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

/**
 * the lower the number the better it is
 * 
 * @param {Playfield} board 
 */
function rateBoardState(board)
{
    const stackHeightDiffence = findStackHeightDiffence(board)
    return countHoles(board) + (stackHeightDiffence * (stackHeightDiffence < 3 ? 1 : stackHeightDiffence === 3 ? 2 : 3))
}

/**
 * 
 * @param {Playfield} board 
 */
function findMaxHeightOfEachColumn(board)
{
    let maxHeights = new Array(board.width);

    for (let column = 0; column != board.width; ++column)
    {
        let highestRow = -1;
        for (let row = 0; row != board.height; ++row)
        {
            if (board.get(column, row) !== "0")
                highestRow = row;
        }
        maxHeights[column] = highestRow;
    }

    return maxHeights;
}

/**
 * 
 * @param {Playfield} board 
 */
function countHoles(board)
{
    const heights = findMaxHeightOfEachColumn(board)
    let holes = 0;

    for (let column = 0; column != board.width; ++column)
    {
        for (let row = 0; row != heights[column]; ++row)
        {
            if (board.get(column, row) !== "0")
                ++holes;
        }
    }

    return holes;
}

/**
 * 
 * @param {Playfield} board 
 */
function findStackHeightDiffence(board)
{
    const heights = findMaxHeightOfEachColumn(board).sort();

    // heights[0] is the well so the lowest part of the stack is heights[1]
    const lowestPartofTheStack = heights[1];
    const heighestPartOfTheStack = heights.at(-1);
    const heightDiffence = heighestPartOfTheStack - lowestPartofTheStack;
    return heightDiffence;
}

//next score each outcome based on how good the stack is
