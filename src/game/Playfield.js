class Playfield
{
    constructor(width, height)
    {
        this._width = width;
        this._height = height;
        this._board = Array(height + 10).fill(null)
            .map(() => Array(width).fill("0"))
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
        this._board.push(Array(width).fill("0"))
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

    _yToArrayIndex(y)
    {
        return this._board.length - y - 1
    }
}