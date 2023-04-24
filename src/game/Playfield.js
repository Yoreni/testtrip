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
        return this._board[this._yToArrayIndex(y)][x]
    }

    set(x, y, mino)
    {
        this._board[this._yToArrayIndex(y)][x] = mino;
    }

    clearLine(y)
    {
        this._board.splice(this._yToArrayIndex(y), 1);
        this._board.unshift(Array(this._width).fill("0"))
    }

    doesColide(minos)
    {
        if (minos instanceof FallingPiece)
            minos = minos.minos;

            for (let mino of minos)
            {
                //check if the mino is in bounds
                if (mino.y < 0)
                    return true;

                if (mino.x < 0 || mino.x >= this.width)
                    return true;

                if (this.get(mino.x, mino.y) !== "0")
                    return true;
            }
            return false;
    }

    get completedLines()
    {
        let completedLines = [];
        for (let [y, line] of this._board.entries())
        {
            if (line.indexOf("0") === -1)
                completedLines.push(this._yToArrayIndex(y))
        }
        return completedLines;
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

    //TODO: maybe this makes things more complicated then they need to be?
    _yToArrayIndex(y)
    {
        return this._board.length - y - 1
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