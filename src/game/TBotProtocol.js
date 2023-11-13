//from this
//https://github.com/tetris-bot-protocol/tbp-spec

const directionConversion = {
    "north": 0,
    "east": 1,
    "south": 2,
    "west": 3,
}

class TBotProtocol
{
    #player;
    #bot;
    #isBotReady;
    #hasGameStarted;
    #move;

    /**
     * 
     * @param {PlayerLogic} player 
     * @param {String} bot 
     */
    constructor(player, bot)
    {
        this.#player = player;
        this.#bot = new Worker(bot);
        this.#isBotReady = false;
        this.#hasGameStarted = false;
        this.#move = null;

        eventManager.addEvent("onGameStart", (event) => 
        {
            this.#hasGameStarted = true;
            console.log("game started")
            this.sendStart();
        })

        eventManager.addEvent("onPiecePlace", (event) => 
        {
            this.sendPlay(this.#move);
            this.sendNewPiece();
            this.sendSugest();
        })

        eventManager.addEvent("onPieceLock", (event) => 
        {
            const center = findPieceCenter(event.piece)
            console.log(`Placed piece x: ${center.x}, y: ${center.y} rotation: ${["north", "east", "south", "west"][event.piece.rotation]}`)
        })

        this.#bot.onmessage = (message) => 
        {
            message = message.data;
            if (message.type === "info")
                this.sendRules();
            if (message.type === "ready")
            {
                this.#isBotReady = true;
                console.log("bot ready")
                this.sendStart();
            }
            if (message.type === "error")
                 console.error(message.reason);
            if (message.type === "stop")
                {}
            if (message.type === "quit")
                {}
            if (message.type === "suggestion")
            {
                this.#move = message.moves[0]
                console.log(JSON.stringify(this.#move))
                console.log(`misamino says Piece: ${this.#move.location.type},
                 X: ${this.#move.location.x}, Y: ${this.#move.location.y},
                Rotation: X: ${this.#move.location.orientation}`)
                misaminoPoint = Point(this.#move.location.x, this.#move.location.y);
                misaminoPoint.rotation = directionConversion[this.#move.location.orientation];
                misaminoPoint.type = this.#move.location.type;
            }
        };
    }

    sendRules()
    {
        this.#bot.postMessage({
            type: "rules",
        });
    }

    sendStart()
    {
        if (this.#hasGameStarted && this.#isBotReady)
        {
            this.#bot.postMessage({
                type: "start",
                hold: this.#player.holdPiece,
                queue: [this.#player.currentPiece.type, ...this.#player.nextQueue],
                combo: this.#player.combo,
                back_to_back: (this.#player._stats.b2b ?? 0) > 0,
                board: this.#toBoardNotation(this.#player.board),
            })
            console.log("bot started")
            this.sendSugest();
        }
    }

    sendSugest()
    {
        this.#bot.postMessage({
            type: "suggest",
        })
    }

    sendPlay()
    {
        this.#bot.postMessage({
            type: "play",
            move: this.#move,
        })
    }

    sendNewPiece()
    {
        this.#bot.postMessage({
            type: "new_piece",
            piece: this.#player.nextQueue[4],   //change when the num of preview pieces change
        })
    }

    sendStop()
    {
        this.#bot.postMessage({
            type: "stop",
        })
    }

    sendQuit()
    {
        this.#bot.postMessage({
            type: "quit",
        })
    }

    /**
     * 
     * @param {Playfield} board 
     * @returns {String[]}
     */
    #toBoardNotation(board)
    {
        let boardArray = []
        for (let y = 0; y != board.height + Playfield.BOARD_BUFFER; ++y)
        {
            let row = []
            for (let x = 0; x != board.width; ++x)
            {
                const piece = board.get(x, y)
                row.push(piece === "#" ? "G" : 
                    piece === "0" ? null : piece)
            }
            boardArray.push(row)
        }

        return boardArray
    }
}

/**
 * 
 * @param {FallingPiece} piece 
 */
function findPieceCenter(piece)
{
    const ogrinal = Point(piece.x, piece.y)
    if (piece.type !== "I")
        return ogrinal

    if (piece.rotation === 0)
        return Point(piece.x, piece.y + 1)
    if (piece.rotation === 1)
        return Point(piece.x + 1, piece.y + 1)
    if (piece.rotation === 2)
        return Point(piece.x + 1, piece.y)
    return ogrinal
}

/**
 * hard drops a piece for bots
 * 
 * @param {Playfield} board 
 * @param {FallingPiece} piece 
 * @returns 
 */
function softDropPiece(board, piece)
{
    if (board.doesColide(piece))
        return null;

    while (!board.doesColide(piece))
        --(piece.y);
    ++(piece.y);
}

/**
 * gets all the places on the board that can be obtained without spins and tucks
 * 
 * @param {Playfield} board 
 * @param {String} piece piece type
 */
// function getPossibleMoves(board, piece)
// {
//     const ogrinalBoard = board;
//     // const ogrinalPiece = piece;
//     let outcomes = []

//     for (let column = 0; column != ogrinalBoard.width; ++column)
//     {
//         for (let rotation = 0; rotation != 4; ++rotation)
//         {
//             board = ogrinalBoard.copy();
//             let thisPiece = new FallingPiece(piece);
//             thisPiece.y = board.height + 2;
//             thisPiece.x = column;
//             thisPiece.rotate(rotation);

//             let actions = []
//             if (rotation !== 0)
//                 actions.push([,"rc", "r180", "rac"])

//             const pieceCenter = pieceCenter(thisPiece)
    
//             board = placePiece(board, thisPiece);
//             if (board !== null)
//                 outcomes.push({
//                     x: thisPiece.x,
//                     y: thisPiece.y,
//                     rotation: thisPiece.rotation,
//                     type: thisPiece.type,
//             })
//         }
//     }

//     return outcomes;
// }

function hasVisted(piece, visitedList)
{
    for (const state of visitedList)
        return piece.x === state.piece.x 
            && piece.y === state.piece.y 
            && piece.rotation === state.piece.rotation;
}

/**
 * find the keypresses in order to a pieces in a certain way
 * 
 * @param {FallingPiece} desiredPiece 
 * @param {Playfield} board 
 * 
 * @returns {String[] | null} path to take
 * proform each action in order
 * 
 * possible actions are:
 * left - move piece left
 * right - move piece right
 * hd - harddrop
 * sd - softdrop down to the bottom
 * rc - rotate clockwise
 * rac - rotate anti clockwise
 * r180 - rotate 180
 * 
 * returns null if the piece if impossible to place there
 */
function findPathToPlacePiece(desiredPiece, board)
{
    if (board.doesColide(desiredPiece))
        return null;

    //const goal = findPieceCenter(desiredPiece)
    let moves = getPossibleMoves(board, desiredPiece.type);
    let vistied = []
    let log = []
    for (const piece of moves)
    {
        const pieceCenter = findPieceCenter(piece.piece)
        let actions = []

        if (piece.rotation !== 0)
            actions.push([null, "rc", "r180", "rac"][piece.rotation])
        

        if (pieceCenter.x > 5)
            actions.push(...Array(pieceCenter.x - 5).fill("right"))
        if (pieceCenter.x < 5)
            actions.push(...Array(5 - pieceCenter.x).fill("left"))

        // if (piece.rotation === desiredPiece.rotation)
        // {
        //     log.push(`${pieceCenter.x} ${pieceCenter.y} ${piece.rotation}
        //     ${pieceCenter.x === desiredPiece.x} ${pieceCenter.y === desiredPiece.y}
        //     ${desiredPiece.x} ${desiredPiece.y}`)
        // }

        if (pieceCenter.x === desiredPiece.x && pieceCenter.y === desiredPiece.y && piece.rotation === desiredPiece.rotation)
            return [...actions, "hd"]

        vistied.push({
            actions: [...actions, "sd"],
            piece: piece.piece,
            pieceCenter,
        })
    }

    let index = 0;
    while (index < vistied.length)
    {
        const move = vistied[index]

        if (move.actions.length > 20)
            return undefined; //timeout

        let leftPiece = move.piece.copy()
        leftPiece.x -= 1;
        if (!hasVisted(leftPiece, vistied))
        {
            const pieceCenter = findPieceCenter(leftPiece);
            const actions = [...move.actions, "left"]
            if (pieceCenter.x === desiredPiece.x && pieceCenter.y === desiredPiece.y && leftPiece.rotation === desiredPiece.rotation)
                return actions
            
            vistied.push({
                actions,
                piece: leftPiece,
                pieceCenter: pieceCenter
            })
        }

        let rightPiece = move.piece.copy()
        rightPiece.x += 1;
        if (!hasVisted(rightPiece, vistied))
        {
            const pieceCenter = findPieceCenter(rightPiece);
            const actions = [...move.actions, "right"]
            if (pieceCenter.x === desiredPiece.x && pieceCenter.y === desiredPiece.y && rightPiece.rotation === desiredPiece.rotation)
                return actions
            
            vistied.push({
                actions,
                piece: rightPiece,
                pieceCenter: pieceCenter
            })
        }

        let clockwisePiece = rotateWithKicktable(move.piece, 1, board, SRSkicktable)
        if (clockwisePiece !== null && !hasVisted(clockwisePiece, vistied))
        {
            const pieceCenter = findPieceCenter(clockwisePiece);
            const actions = [...move.actions, "rc"]
            if (pieceCenter.x === desiredPiece.x && pieceCenter.y === desiredPiece.y && clockwisePiece.rotation === desiredPiece.rotation)
                return actions
            
            vistied.push({
                actions,
                piece: clockwisePiece,
                pieceCenter: pieceCenter
            })
        }

        let antiClockwisePiece = rotateWithKicktable(move.piece, 3, board, SRSkicktable)
        if (antiClockwisePiece !== null && !hasVisted(antiClockwisePiece, vistied))
        {
            const pieceCenter = findPieceCenter(antiClockwisePiece);
            const actions = [...move.actions, "rac"]
            if (pieceCenter.x === desiredPiece.x && pieceCenter.y === desiredPiece.y && antiClockwisePiece.rotation === desiredPiece.rotation)
                return actions
            
            vistied.push({
                actions,
                piece: antiClockwisePiece,
                pieceCenter: pieceCenter
            })
        }


        let flipPiece = rotateWithKicktable(move.piece, 2, board, SRSkicktable)
        if (flipPiece !== null && !hasVisted(flipPiece, vistied))
        {
            const pieceCenter = findPieceCenter(flipPiece);
            const actions = [...move.actions, "r180"]
            if (pieceCenter.x === desiredPiece.x && pieceCenter.y === desiredPiece.y && flipPiece.rotation === desiredPiece.rotation)
                return actions
            
            vistied.push({
                actions,
                piece: flipPiece,
                pieceCenter: pieceCenter
            })
        }

        ++index;
    }

    // for (const line of log)
    //     console.log(line)


    return null;
}

let board = new Playfield(10, 20)
// board.set(0, 0, "I")
// board.set(1, 0, "I")
// board.set(2, 0, "I")
// board.set(3, 0, "I")
// board.set(5, 0, "I")
// board.set(6, 0, "I")
// board.set(7, 0, "I")
// board.set(8, 0, "I")
// board.set(9, 0, "I")

// board.set(0, 1, "I")
// board.set(1, 1, "I")
// board.set(2, 1, "I")
// board.set(6, 1, "I")
// board.set(7, 1, "I")
// board.set(8, 1, "I")
// board.set(9, 1, "I")

// board.set(3, 2, "I")

board.set(0, 0, "I")
board.set(1, 0, "I")
board.set(2, 0, "I")
board.set(3, 0, "I")

board.set(6, 0, "I")
board.set(7, 0, "I")
board.set(8, 0, "I")
board.set(9, 0, "I")

board.set(0, 1, "I")
board.set(1, 1, "I")
board.set(2, 1, "I")

board.set(5, 1, "I")
board.set(6, 1, "I")
board.set(7, 1, "I")
board.set(8, 1, "I")
board.set(9, 1, "I")

board.set(4, 2, "I")

let piece = new FallingPiece("Z");
piece.y = 0
piece.x = 4

setTimeout(() => {
    console.log(findPathToPlacePiece(piece, board))
}, 1000)