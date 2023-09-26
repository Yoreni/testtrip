class Playfield
{obj
    constructor(width, height)
    {
        this._width = width;
        this._height = height;
        this._board = Array(height + 10).fill(null)
            .map(() => Array(width).fill("0"))

        //TST setup
        // this._board[25] = ["Y", "Y", "Y","0", "0", "Y","Y", "Y", "Y","Y"];
        // this._board[26] = ["Y", "Y", "Y","0", "0", "0","Y", "Y", "Y","Y"];
        // this._board[27] = ["Y", "Y", "Y","Y", "Y", "0","Y", "Y", "Y","Y"];
        // this._board[28] = ["Y", "Y", "Y","Y", "0", "0","Y", "Y", "Y","Y"];
        // this._board[29] = ["Y", "Y", "Y","Y", "Y", "0","Y", "Y", "Y","Y"];

        //180 spin test
        // this._board[2] = ["Y", "Y", "Y","Y", "Y", "0","Y", "Y", "Y","Y"];
        // this._board[1] = ["Y", "Y", "Y","Y", "Y", "0","Y", "Y", "Y","Y"];
        // this._board[0] = ["Y", "Y", "Y","Y", "0", "0","Y", "Y", "Y","Y"];

        //tetris pc
        // this._board[3] = ["Y", "Y", "Y","Y", "Y", "0","Y", "Y", "Y","Y"];
        // this._board[2] = ["Y", "Y", "Y","Y", "Y", "0","Y", "Y", "Y","Y"];
        // this._board[1] = ["Y", "Y", "Y","Y", "Y", "0","Y", "Y", "Y","Y"];
        // this._board[0] = ["Y", "Y", "Y","Y", "Y", "0","Y", "Y", "Y","Y"];
    }

    get width()
    {
        return this._width;
    }

    get height()
    {
        return this._height;
    }

    get(x, y)
    {
        return this._board[y][x]
    }

    set(x, y, mino)
    {
        this._board[y][x] = mino;
    }

    clearLine(y)
    {
        this._board.splice(y, 1);
        this._board.push(Array(this._width).fill("0"))
    }

    clearLines(ys)
    {
        //sorting is important cos otherwise a splice can make all the other intended ys inacarate
        ys = ys.sort((a, b) => b - a)
        for (let y of ys)
            this.clearLine(y)
    }

    doesColide(minos, debug = false)
    {
        if (minos === undefined)
            return;

        if (minos instanceof FallingPiece)
            minos = minos.minos;

        if (typeof(minos) === "object" && minos.x !== undefined && minos.y !== undefined)
            minos = [minos]

        // if (debug)
        //     console.log(minos)

            let idx = 0
        for (let mino of minos)
        {
            //check if the mino is in bounds
            if (mino.y < 0)
            {
                // if (debug)
                //     console.log("at check 1, mino " + idx + `(${mino.x}), ${mino.y}`)
                return true;
            }

            if (mino.x < 0 || mino.x >= this.width)
            {
                // if (debug)
                // console.log("at check 2, mino " + idx + `(${mino.x}), ${mino.y}`)
                return true;
            }

            if (this.get(mino.x, mino.y) !== "0")
            {
                // if (debug)
                // console.log("at check 3, mino " + idx + `(${mino.x}), ${mino.y}`)
                return true;
            }

            ++idx
        }
        return false;
    }

    get completedLines()
    {
        let completedLines = [];
        for (let [y, line] of this._board.entries())
        {
            if (line.indexOf("0") === -1)
                completedLines.push(y)
        }
        return completedLines;
    }

    get isPc()
    {
        let isPc = true
        for (let line of this._board)
        {               //'&& isPc' will make it so if it finds a line thats false it will stay false
            isPc = line.every(idx => idx === "0") && isPc;
        }
        return isPc;
    }

    copy()
    {
        let copy = new Playfield(this.width, this.height);
        for (let y = 0; y != this.height + 10; ++y)
        {
            for (let x = 0; x != this.width; ++x)
                copy.set(x, y, this.get(x, y));
        }

        return copy;
    }

    insertLine(line, index)
    {
        if (line.length != this.width)
            throw `Cant insert a line with ${line.length} items into a board that has width of ${this.width}`;

        this._board.splice(index, 0, line);
        this._board.pop();
    }
}

function leftToColision(fallingPiece, playfield)
{
    if (playfield.doesColide(fallingPiece))
        return 0;

    fallingPiece = fallingPiece.copy();
    let count = 0;
    while (!playfield.doesColide(fallingPiece))
    {
        fallingPiece.x -= 1;
        count += 1;
    }

    fallingPiece.x += 1;             //1 above the place it would colide with other minos/bounds
    count -= 1;
    return count;
}

function rightToColision(fallingPiece, playfield)
{
    if (playfield.doesColide(fallingPiece))
        return 0;

    fallingPiece = fallingPiece.copy();
    let count = 0;
    while (!playfield.doesColide(fallingPiece))
    {
        fallingPiece.x += 1;
        count += 1
    }

    fallingPiece.x -= 1;             //1 above the place it would colide with other minos/bounds
    count -= 1;
    return count;
}

/**
 * 
 * adds garbage to a board
 * 
 * @param {Playfield} playfield 
 * @param {Number} wellColumn a number between and the playfield width
 * @param {Number} amount (number of garbge to send) a number >= 0
 */
function addGarbage(playfield, wellColumn, amount)
{
    const garbageLine = Array.from({length: playfield.width}, 
        (_, column) => column === wellColumn ? "0" : "#");
    
    for (let count = 0; count != amount; ++count)
        playfield.insertLine(garbageLine, 0);
}