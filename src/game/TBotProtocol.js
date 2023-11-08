//from this
//https://github.com/tetris-bot-protocol/tbp-spec

class TBotProtocol
{
    #player;
    #bot;

    /**
     * 
     * @param {Player} player 
     * @param {String} bot 
     */
    constructor(player, bot)
    {
        this.#player = player;
        this.#bot = bot;
    }

    sendRules()
    {
        const message = {
            type: "rules",
            hold: this.#player.holdPiece,
            queue: this.#player.nextQueue,
            combo: this.#player.combo,
            back_to_back: (this.#player._stats.b2b ?? 0) > 0,
            board: this.#player.board
        }
    }

    sendStart()
    {
        const message = {
            type: "start",
            move: undefined,
        }
    }

    sendSugest()
    {
        const message = {
            type: "sugest",
        }
    }

    sendPlay()
    {
        const message = {
            type: "play",
        }
    }

    sendNewPiece()
    {
        const message = {
            type: "new_piece",
            piece: this.#player.queue.at(-1),
        }
    }

    sendStop()
    {
        const message = {
            type: "stop",
        }
    }

    sendQuit()
    {
        const message = {
            type: "quit",
        }
    }
}