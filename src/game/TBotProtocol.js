//from this
//https://github.com/tetris-bot-protocol/tbp-spec

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
            const center = pieceCenter(event.piece)
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
function pieceCenter(piece)
{
    if (piece.type !== "I")
        return Point(piece.x, piece.y)

    if (piece.rotation === 0)
        return Point(piece.x, piece.y + 1)
    if (piece.rotation === 1)
        return Point(piece.x + 1, piece.y + 1)
    if (piece.rotation === 2)
        return Point(piece.x + 1, piece.y)
    return Poin
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


}