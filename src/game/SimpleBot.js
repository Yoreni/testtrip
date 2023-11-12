let testBoard = new Playfield(10, 20)
// let piece = new FallingPiece("T")
// piece.y = 20
// piece.x = 5;
class SimpleBot
{
    #player;
    #chosenMove;

    /**
     * 
     * @param {PlayerLogic} logicPlayer 
     */
    constructor(logicPlayer)
    {
        this.logic = logicPlayer;
        this.#chosenMove = null;
    }

    inputs()
    {
        if (this.#chosenMove === null)
        {
            this.#chosenMove = chooseMove(this.#player);
        }


        if (this.#player.currentPiece.type !== this.#chosenMove.type)
            this.#player.hold();
        const piece = this.#player.currentPiece;
        if (piece.rotation !== this.#chosenMove.rotation)
            this.#player.rotateClockwise();
        else if (piece.x !== this.#chosenMove.x)
            this.#player.moveCurrentPiece(Math.sign(this.#chosenMove.x - piece.x))
        else
        {   if (this.delay > 0)
                --(this.delay)
            else
            {            
                this.#placePiece();
                //this.delay = 1 * 15;
            }
        }
    }

    #placePiece()
    {
        const targetBoard = this.#chosenMove.board;
        const holesBefore = countHoles(this.#player.board)
        console.log(targetBoard.toString())
        this.#player.harddrop();

        if (targetBoard.equals(this.#player.board))
            console.info("The playfields match")
        else
            console.info("The piece was not placed in the intended spot")
        // console.info(`Target X: ${this.#chosenMove.x}, Actual X: ${this.#player.currentPiece.x}`)
        console.log(`Hole count: ${holesBefore} -> ${countHoles(this.#player.board)}`)
        console.log(`Stak height ${findStackHeightDiffence(this.#player.board, true)}`)
        console.log(this.#chosenMove.rating, this.#chosenMove.rating.scoreCatagoryies.isQuad)

        this.#chosenMove = null;
    }

    get logic()
    {
        return this.#player
    }

    set logic(logicPlayer)
    {
        if (logicPlayer instanceof PlayerLogic)
            this.#player = logicPlayer
        else
        {
            console.log(logicPlayer)
            throw "The argument provided is not a logic player";
        }
    }
}

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
 * gets all the places on the board that can be obtained without spins and tucks
 * 
 * @param {Playfield} board 
 * @param {String} piece piece type
 */
function getPossibleMoves(board, piece)
{
    const ogrinalBoard = board;
    // const ogrinalPiece = piece;
    let outcomes = []

    for (let column = -3; column != ogrinalBoard.width; ++column)
    {
        for (let rotation = 0; rotation != 4; ++rotation)
        {
            board = ogrinalBoard.copy();
            let thisPiece = new FallingPiece(piece);
            thisPiece.y = board.height + 2;
            thisPiece.x = column;
            thisPiece.rotate(rotation);
    
            board = placePiece(board, thisPiece);
            if (board !== null)
                outcomes.push({
                    board: board,
                    x: thisPiece.x,
                    y: thisPiece.y,
                    rotation: thisPiece.rotation,
                    piece: thisPiece,
                    type: thisPiece.type,
            })
        }
    }

    return outcomes;
}

/**
 * 
 * @param {PlayerLogic} logicPlayer 
 * @param {String} piece piece type
 * @returns {Object}
 */
function chooseMoveForPiece(logicPlayer, piece)
{
    let possibleMoves = getPossibleMoves(logicPlayer.board, piece);
    possibleMoves.map(state => state.rating = rateBoardState(logicPlayer, state));
    possibleMoves.sort((state1, state2) => state1.rating.total - state2.rating.total);
    return possibleMoves[0];
}

/**
 * 
 * @param {PlayerLogic} logicPlayer 
 * @returns {Object}
 */
function chooseMove(logicPlayer)
{
    const currentPieceDession = chooseMoveForPiece(logicPlayer, logicPlayer.currentPiece.type)
    const holdPiece = logicPlayer.holdPiece ?? logicPlayer.nextQueue[0]
    const holdPieceDession = chooseMoveForPiece(logicPlayer, holdPiece)
    return currentPieceDession.rating.total < holdPieceDession.rating.total ? currentPieceDession : holdPieceDession
}

/**
 * the lower the number the better it is
 * 
 * @param {PlayerLogic} logicPlayer 
 * @param {Playfield} board 
 */
function rateBoardState(player, move)
{
    const stackHeightDiffence = findStackHeightDiffence(move.board);
    const stateNumOfHoles = countHoles(move.board);
    const linesClearing = move.board.completedLines.length

    const scoreCatagoryies =
    {
        "holes": stateNumOfHoles * 10,
        "newHoles": (stateNumOfHoles - countHoles(player.board)) * 75,
        "height": (move.y > 0 ? move.y : 0) * 10,
        "isQuad": stackHeightDiffence < 4 ? [0, 50, 50, 0, -200][linesClearing] : [0, -100, -120, -160, -350][linesClearing],
        "stackHeight": (stackHeightDiffence * (stackHeightDiffence < 3 ? 3 ** (stackHeightDiffence - 0) : 0)),
        "dependency": (fixesDependency(player.board, move) * -300) * stackHeightDiffence < 3 ? [2, 1, 1, 0.9, 0.8][linesClearing] : 1
    }

    const total = sum(Object.values(scoreCatagoryies))

    return {total, scoreCatagoryies}
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
        if (heights[column] === -1)
            continue

        for (let row = 0; row != heights[column]; ++row)
        {
            if (board.get(column, row) === "0")
                ++holes;
        }
    }

    return holes;
}

/**
 * 
 * higher the number the more uneven the stack is
 * 
 * @param {Playfield} board 
 */
function findStackHeightDiffence(board, debug = false)
{
    const heights = findMaxHeightOfEachColumn(board).sort((num1, num2) => num1- num2);

    // heights[0] is the well so the lowest part of the stack is heights[1]
    const lowestPartofTheStack = heights[1];
    const heighestPartOfTheStack = heights.at(-1);
    const heightDiffence = heighestPartOfTheStack - lowestPartofTheStack;
    if (debug)
        console.log(`Min: ${lowestPartofTheStack}, Max: ${heighestPartOfTheStack}, Dif: ${heightDiffence}, Heights: ${heights}`)
    return heightDiffence;
}

function fixesDependency(board, move)
{
    const isPresent = (offsetX, offsetY) => 
    {
        const mino = board.get(move.x + offsetX, move.y + offsetY);
        return mino !== "0" || mino !== undefined;
    }

    if (move.type === "O")
    {
        return isPresent(-1, 0) && isPresent(2, 0)
            && isPresent(-1, -1) && isPresent(2, -1);
    }
    if (move.type === "I")
    {
        if (move.rotation % 2 === 0)
            return false;
        else
        {
            const checkAll = [Point(move.x - 1, move.y), Point(move.x + 1, move.y),
                    Point(move.x - 1, move.y - 1), Point(move.x + 1, move.y - 1),
                    Point(move.x - 1, move.y - 2), Point(move.x + 1, move.y - 2)]
            // console.log(checkAll)
            return isPresent(-1, 0) && isPresent(1, 0)
             && isPresent(-1, -1) && isPresent(1, -1)
             && isPresent(-1, -2) && isPresent(1, -2) ;
        }
    }
    return false;
}

// let board = new Playfield(10, 20);
// for (let x = 0; x != board.width; ++x)
// {
//     for (let y = 0; y != 3; ++y)
//         board.set(x, y, "S");
// }
// board.set(4, 0, "0")
// board.set(4, 1, "0")
// board.set(4, 2, "0")

// console.log(board.toString())

// let piece = new FallingPiece("I")
// piece.rotate(1);
// piece.x = 4
// while (!board.doesColide(piece))
//     --(piece.y);
// ++(piece.y)
// console.log(fixesDependency(board, piece))

