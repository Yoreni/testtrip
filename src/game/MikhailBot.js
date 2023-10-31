// based on https://github.com/mikhail-vlasenko/Tetris-AI

// let testBoard = new Playfield(10, 20)
// let piece = new FallingPiece("T")
// piece.y = 20
// piece.x = 5;

class MikhailBot
{
    #player;
    #chosenMove;
    #keys;

    /**
     * 
     * @param {PlayerLogic} logicPlayer 
     */
    constructor(logicPlayer)
    {
        this.logic = logicPlayer;

        this.playSafe = false; //CONFIG['play safe']
        this.startTime = new Date().getTime()
        this.speed = 1
        this.clearing = false; //CONFIG['play for survival']
        this.heldPiece = -1
        this.focusBlank = false;
        this.scared = false
        this.choicesFor2nd = 4 //CONFIG['starting choices for 2nd']

        this.#keys = 
        {
            left: new KeyDetector(controls.left),
            right: new KeyDetector(controls.right),
            softDrop: new KeyDetector(controls.softDrop),
            rotateClockwise: new KeyDetector(controls.rotateClockwise),
            rotateAnticlockwise: new KeyDetector(controls.rotateAnticlockwise),
            hold: new KeyDetector(controls.hold),
            rotate180: new KeyDetector(controls.rotate180),
            hardDrop: new KeyDetector(controls.hardDrop),
        }

         //thank you zztetris
         const handlingCode = (dir) =>
         {
             if (this.#player === undefined || !this.#player.isAlive)
                 return;
 
             //-1 is left, 1 is right
             this.#player.moveCurrentPiece(dir);
             const key = dir === 1 ? this.#keys.right : this.#keys.left;
             const otherKey = dir !== 1 ? this.#keys.right : this.#keys.left;
 
             setTimeout(() =>
             {
                 //check if you are still holding the key
                 if (Math.round(key.getSecondsDown() * 1000) < handling.DAS)
                     return;
 
                 //if 0 ARR just teleport it to one of the sides and be done
                 if (handling.ARR === 0)
                     this.#player.moveCurrentPiece(dir * 1.79e308)
 
                 const loop = setInterval(() => 
                 {
                     const tapback = otherKey.getSecondsDown() > 0 
                             && key.getSecondsDown() > otherKey.getSecondsDown()
                     if (tapback)
                         return;
 
                     if (key.getSecondsDown() > 0)
                         this.#player.moveCurrentPiece(dir);
                     else
                         clearInterval(loop);
                 }, handling.ARR);
             }, handling.DAS);
 
         }
         this.#keys.left.onDown = () => handlingCode(-1);
         this.#keys.right.onDown = () => handlingCode(1);

    }

    inputs()
    {
        if (this.#keys.hardDrop.framesDown === 1)
            this.#player.harddrop();
        if (this.#keys.softDrop.framesDown > 0)
            this.#player.softDrop();
        if (this.#keys.rotateClockwise.framesDown === 1)
            this.#player.rotateClockwise();
        if (this.#keys.rotateAnticlockwise.framesDown === 1)
            this.#player.rotateAnticlockwise();
        if (this.#keys.rotate180.framesDown === 1)
            this.#player.rotate180();
        if (this.#keys.hold.framesDown === 1)
            this.#player.hold();

        const action = this.#chooseAction()
        console.log(action.score, action.expect_tetris)
        console.log("depth", this.#findRoofs(this.#player.board)[3])
        // console.log(action.field)
        //this.#chooseAction()
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
        const roofs = this.#findRoofs(this.#player.board)

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

    #findRoofs(field)
    {
        const tops = Array.from({ length: 10 }, () => [0, 0]);
        let blankCnt = 0;
        let blankDepth = 0;
    
        for (let i = field.height - 1; i >=  0; i--)
        {
            for (let j = 0; j < field.width; j++) 
            {
                if (field.get(j, i) !== "0") 
                {
                    if (tops[j][0] === 0) 
                        tops[j][0] = -2 + i;
                    
                    tops[j][1] += 1;
                } 
                else if (field.get(j, i) === "0" && tops[j][0] !== 0)
                {
                    blankCnt += 1;
                    blankDepth += tops[j][1] - 1;
                }
            }
        }
    
        let maxTop = 0;
        for (let j = 0; j < tops.length; j++) 
            maxTop = Math.max(maxTop, tops[j][0]);
    
        return [blankCnt, maxTop, tops.map(top => top[0]), blankDepth];
    }

    /**
     * 
     * @param {Playfield} field 
     * @param {String} piece type of piece 
     * @returns 
     */
    #calcBest(field, piece)
    {
        let results = this.#findAllLandings(field, piece);
        for (let result of results)
        {
            const score = this.#getScore(result.field)
            result.score = score[0]
            result.expect_tetris = score[1]
        }

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
        //console.log(completedLines)

        return [field, completedLines.length];
    }

    #almostFullLine(cleared)
    {
        for (let y = 0; y != this.#player.board.height; ++y)
        {
            let numOfMinosInRow = 0;
            for (let x = 0; x != this.#player.board.width; ++x)
                numOfMinosInRow += this.#player.board.get(x, y) !== "0"

            if (numOfMinosInRow === 9)
                return 2;
            else if (numOfMinosInRow === 8)
                return 0.5;
        }

        return 0;
    }

    /**
     * 
     * @param {Playfield} field 
     * @returns 
     */
    #getScore(field)
    {
        let expect_tetris = false;
        let score = 0;

        const clear = this.#clearLines(field);
        const cleared = clear[0];
        const roofs = this.#findRoofs(field);
        score += this.#almostFullLine(cleared)

        // clearing 4 lines at once is very good
        //console.log("tetris", clear[1])
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
            score -= (roofs[1] * 2) ** 1.3  //height of highest piece EXP
           // console.log(`${roofs[0] * 5} - ${roofs[3]} - ${(roofs[1] * 2) ** 1.3}`)
            return [score, expect_tetris];
        }

        score -= roofs[0] * 10  // blank spaces
        score -= roofs[3] * 2

        return [score, expect_tetris];

        // height doesn't matter when its low
        if (roofs[1] > 7)
        {
           // console.log(roofs[1] ** 1.4)
           // score -= roofs[1] ** 1.4 //EXP
        }
        score -= this.#findHole(roofs[2]) * 10
        if (this.focus_blank)
        {
            score -= roofs[3] * 3
            score += 5 * clear[1]
            return [score, expect_tetris]
        }

        score -= 3 * clear[1];
        if (roofs[2][9] != 0)
        {
            score -= 10;
            score -= roofs[2][9];
        }
        // const pitHeight = this.#findPit(cleared, roofs[2])

        return [score, expect_tetris]
    }

    #findPit(field, tops)
    {
        let gapIdx = [];
        for (let y = 0; y !== field.height; ++y)
        {
            let numOfMinosInRow = 0;
            for (let x = 0; x !== this.#player.board.width; ++x)
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
            else if (gapIdx[y] === currentPit && currentPit !== -1)
                ++pitHeight;
        }

        return Math.max(maxPitHeight, currentPit);
    }

    #findHole(tops)
    {
        let holeCount = 0;
        tops.unshift(20);
        tops[tops.length - 1] = 20;

        for (let index = 1; index != tops.length - 1; ++index)
        {
            if (tops[index - 1] - 2 > tops[index] && tops[index] < tops[index + 1] - 2)
                ++holeCount;
            else if (tops[index - 1] - 4 > tops[index] && tops[index] < tops[index + 1] - 4)
                holeCount += Math.min(tops[index - 1] - 4 - tops[index], tops[index + 1] - 4 - tops[index])
        }

        return holeCount;
    }

    /**
     * 
     * @param {Playfield} field 
     * @param {FallingPiece} piece 
     */
    #land(board, piece)
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
     * @param {Playfield} field 
     * @param {String} piece type of piece
     */
    #findAllLandings(field, pieceType)
    {
        if (pieceType === undefined || pieceType === null)
            return []

        let results = []
        for (let rotation = 0; rotation != 4; ++rotation)
        {
            for (let x = -3; x != 10; ++x)
            {
                const piece = new FallingPiece(pieceType);
                piece.y = 20;
                piece.x = x;
                piece.rotate(rotation);

                let newField = this.#land(field.copy(), piece)
                if (newField !== null)
                    results.push({rotation, x, pieceType, field: newField})
            }
        }
        return results
    }

    #chooseAction()
    {
        const board = this.#player.board;
        const currentPiece = this.#player.currentPiece.type;
        const holdPiece = this.#player.holdPiece ?? this.#player.nextQueue[0];

        if (board === undefined || currentPiece === undefined)
            return []

        this.#updateState();

        const currentPieceResult = this.#calcBest(board, currentPiece)[0];
        if (!this.#player.holdUsed && holdPiece !== null)
        {
            const holdPieceResult =  this.#calcBest(board, holdPiece)[0];
            if ((holdPieceResult.score + pieceWeight(holdPiece)) 
                > (currentPieceResult.score + pieceWeight(currentPiece)))
            {
                return holdPieceResult;
            }
        }
        return currentPieceResult;
    }
}

function pieceWeight(figure)
{
    const weights = { // additional score
       "I": 0,
       "O": 8,
       "T": 7,
       "J": 7,
       "L": 7,
       "S": 10,
       "Z": 10
    }
    return weights[figure]
}

