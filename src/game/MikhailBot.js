// based on https://github.com/mikhail-vlasenko/Tetris-AI

let testBoard = new Playfield(10, 20)
let piece = new FallingPiece("T")
piece.y = 20
piece.x = 5;

class Mikhailbot
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

        this.playSafe = false; //CONFIG['play safe']
        this.startTime = new Date().time()
        this.speed = 1
        this.clearing = false; //CONFIG['play for survival']
        this.heldPiece = -1
        this.focusBlank = false;
        this.scared = false
        this.choicesFor2nd = 4 //CONFIG['starting choices for 2nd']
    }

    inputs()
    {
        // if (this.#chosenMove === null)
        // {
        //     this.#chosenMove = chooseMove(this.#player);
        //     console.log(countHoles(this.#chosenMove.board))
        // }

        // const piece = this.#player.currentPiece;

        // if (piece.rotation !== this.#chosenMove.rotation)
        //     this.#player.rotateClockwise();
        // else if (piece.x !== this.#chosenMove.x)
        //     this.#player.moveCurrentPiece(Math.sign(this.#chosenMove.x - piece.x))
        // else
        // {   if (this.delay > 0)
        //         --(this.delay)
        //     else
        //     {            
        //         this.#player.harddrop();
        //         this.#chosenMove = null;
        //         this.delay = 0 * 60;
        //     }
        // }
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

    #updateState()
    {
        const roofs = this.#findRoofs(this.logicPlayer.board)

        if (roofs[1] >= 13 || this.speed === 3)
            this.scared = true;
        else
            this.scared = false;

        if (roofs[0] > 0)
            this.focusBlank = true;
        else 
            this.focusBlank = false;

        return roofs;
    }

    #findRoofs(field)   // might be wrong
    {
        let tops = Array(10).fill(null).map(() => Array(2).fill("0"))
        let blankCnt = 0;
        let blankDepth = 0;
        for (let x = 0; x != field.width; ++x)
        {
            for (let y = 0; y != field.height; ++y)
            {
                if (field.get(x, y) !== "0")
                {
                    if (tops[y][0] === 0)
                        tops[y][0] = 17 - x;

                    tops[y][1] += 1;
                }
                else if (field.get(x, y) === "0" && tops[y][0] !== 0)
                {
                    ++blankCnt;
                    blankDepth += tops[y][1] - 1;
                }
            }
        }

        return [blankDepth
            ,  array.reduce((currentMax, row) => Math.max(currentMax, row[0]), array[0][0])
            ,  tops.map(row => row[0])
            ,  blankDepth
        ]
    }

    #calcBest(piece)
    {
        let results = this.#findAllLandings(piece);
        for (let result of results)
            result.score, result.expect_tetris = this.get_score(result.field)
        results.sort((state1, state2) => state2.score - state1.score);
        return results;
    }

    /**
     * counts and clears full lines
     * 
     * @param {Playfield} field 
     */
    #clearLines(field)
    {
        field = field.copy();   // doesnt modify the actual playfield
        
        const completedLines = field.completedLines;
        field.clearLines(completedLines);

        return [field, completedLines.length];
    }

    #almostFullLine(cleared)
    {
        let score = 0;
        for (let y = 0; this.#player.board.height; ++index)
        {
            let numOfMinosInRow = 0;
            for (let x = 0; this.#player.board.width; ++index)
                numOfMinosInRow += this.#player.board.get(x, y) !== "0"

            if (numOfMinosInRow === 9)
                score += 2;
            else if (numOfMinosInRow === 8)
                score += 0.5;
        }

        return score;
    }

    #getScore(field)
    {
        let expect_tetris = false;
        let score = 0;

        const clear = this.#clearLines(field);
        const cleared = clear[0];
        const roofs = this.#findRoofs();
        score += this.#almostFullLine(cleared)

        // clearing 4 lines at once is very good
        if (clear[1] >= 4)
        {
            score += 1000;
            expect_tetris = true;
        }

        if (this.scared || this.clearing)
        {
            score += 10 * clear[1];
            score -= roofs[0] * 5  //blank spaces
            score -= roofs[3]  // cumulative depth of blanks
            score -= (roofs[1] + roofs[1]) ** 1.3  //height of highest piece
            return score, expect_tetris;
        }

        score -= roofs[0] * 10  // blank spaces
        score -= roofs[3] * 2

        // height doesn't matter when its low
        if (roofs[1] > 7)
            score -= roofs[1] ** 1.4
        score -= this.findHole(roofs[2]) * 10
        if (this.focus_blank)
        {
            score -= roofs[3] * 3
            score += 5 * clear[1]
            return score, expect_tetris
        }

        score -= 3 * clear[1];
        if (roofs[2][9] != 0)
        {
            score -= 10;
            score -= roofs[2][9];
        }
        const pitHeight = this.findPit(cleared, roofs[2])

        return score, expect_tetris
    }

    #findPit(field, tops)
    {
        let gapIdx = [];
        for (let y = 0; y !== field.height; ++y)
        {
            let numOfMinosInRow = 0;
            for (let x = 0; this.#player.board.width; ++index)
                numOfMinosInRow += this.#player.board.get(x, y) !== "0";

            if (numOfMinosInRow === 9)  //might be wrong
                gapIdx.push(condition.map((value, index) => (value ? index : undefined)).filter(index => index !== undefined))
            else
                gapIdx.push(-1);
        }

        let currentPit = -1;
        let pitHeight = 0;
        let maxPitHeight = 0;
        for (let y = field.height - 1; y >= 0; --y) 
        {
            if (gapIdx[y] !== -1 && currentPit !== gapIdx && tops[gapIdx[y]] < y)
            {
                if (maxPitHeight < pitHeight)
                    maxPitHeight = pitHeight;
                currentPit = gapIdx[y];
                ++pitHeight;
            }
            else if (gapIdx[i] === currentPit && currentPit !== -1)
                ++pitHeight;
        }

        return Math.max(maxPitHeight, currentPit);
    }

    #findHole(roof)
    {

    }

    #findAllLandings(piece)
    {

    }

    #chooseAction()
    {
        this.#updateState();

        const currentPieceResult = this.#calcBest(this.logicPlayer.currentPiece);
        if (!this.logicPlayer.holdUsed)
        {
            const holdPieceResult =  this.#calcBest(this.logicPlayer.holdPiece);
            if ((holdPieceResult.score + pieceWeight(this.logicPlayer.holdPiece)) 
                > (currentPieceResult.score + pieceWeight(this.logicPlayer.currentPiece)))
            {
                return holdPieceResult;
            }
        }

        return currentPieceResult;
    }
}

function pieceWeight(piece)
{

}


