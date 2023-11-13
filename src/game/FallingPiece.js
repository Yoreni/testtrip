class FallingPiece
{
    #type;

    constructor(type)
    {
        if (type === undefined || type === null)
            throw `${type} is an invalid type`;
            
        this._minos = this.#processShape(pieces[type].shape);
        this._rotation = 0;
        this.#type = type;
        this._position = Point(0, 0)
        this._subPosition = Point(0, 0)
        this._lockTimer = 0;
        this._lockResets = 0;
    }

    /**
     * get the center x of the piece
     * @returns {Number}
     */
    get x()
    {
        let x = this._position.x
        // if (this.rotation === 1 || this.rotation === 2 && this.type === "I")
        //     ++x;

        return x;
    }

    set x(newX)
    {
        this._position.x = newX;
    }

    /**
     * get the center y of the piece
     * @returns {Number}
     */
    get y()
    {
        let y = this._position.y;

        // if (this.rotation === 0 || this.rotation === 1 && this.type === "I")
        //     ++y;

        return y
    }

    set y(newY)
    {
        this._position.y = newY;
    }

    /**
     * @returns {String}
     */
    get type()
    {
        return this.#type;
    }

    get rotation()
    {
        return this._rotation;
    }

    get lockTimer()
    {
        return this._lockTimer
    }

    set lockTimer(newNumber)
    {
        this._lockTimer = newNumber;
    }

    get lockResets()
    {
        return this._lockResets
    }

    set lockResets(newLockResets)
    {
        this._lockResets = newLockResets;
    }

    get minos()
    {
        const center = pieces[this.type].center

        return this._minos.map(mino => 
            Point(Math.ceil(mino.x + this.x - center.x) - 0, 
                  Math.ceil(mino.y + this.y - center.y)));
    }

    /**
     * takes a 2D array and turns it into an array of positons for each mino
     * 
     * @param {Array} shape 
     * @returns {Array}
     */
    #processShape(shape)
    {
        let minos = [];

        for (const [yIndex, yElement] of shape.entries())
        {
            for (const [xIndex, xElement] of yElement.entries())
            {
                if (xElement === 1)
                    //shape.length - 1 for y is to fix for the piece being upsidedown
                    //that is caused by how arrays are indexed
                    minos.push(Point(
                        // xIndex - centerTranslationX,
                        // shape.length - 1 - yIndex - centerTranslationY
                        xIndex,
                        shape.length - 1 - yIndex
                    ));
            }
        }

        return minos;
    }

    copy()
    {
        let copy = new FallingPiece(this.type);
        copy._position = deepCopy(this._position);
        copy._subPosition = deepCopy(this._subPosition);
        copy._lockTimer = this._lockTimer;
        copy._lockResets = this._lockResets;
        copy.rotate(this._rotation);
        return copy;
    }

    rotate(amount)
    {
        let rotationMatrix = []
        const newRotation = mod(this._rotation + amount, 4)
     
        switch (mod(newRotation - this._rotation, 4))
        {
           case 0:     //no rotation
                 return;
           case 1:     //clockwise
                 rotationMatrix = [[0, 1],[-1, 0]];
                 break;
           case 2:     //180
                 rotationMatrix = [[-1, 0],[0, -1]]
                 break;
           case 3:     //anti-clockwise
                 rotationMatrix = [[0, -1],[1, 0]]
                 break;
        }

        this._minos = this._minos.map(mino => 
        {
            const center = pieces[this.type].center;
            const x = mino.x - center.x;
            const y = mino.y - center.y;
            const rotation = Point(
            (rotationMatrix[0][0] * x) + (rotationMatrix[0][1] * y),
            (rotationMatrix[1][0] * x) + (rotationMatrix[1][1] * y))
            const result = Point(rotation.x + center.x, rotation.y + center.y);
            return result;
        })

        this._rotation = newRotation;
    }

    rotate2(amount)
    {
        amount = mod(amount, 4);
        if (amount === 0)            //no rotation
            return;
        if (amount === 2)            //180
        {
            this._minos.forEach(row => row.reverse());
            this._minos.reverse();
            this._rotation = mod(this._rotation + amount, 4)
            return;
        }

        for (let y = 0; y != this._minos.length; ++y)
        {
            for (let x = 0; x != y; ++x)
            {
                [
                    this._minos[x][y],
                    this._minos[y][x],
                ] = [
                    this._minos[y][x],
                    this._minos[x][y],
                ]
            }
        }

        if (amount === 1)             //clockwise
            this._minos.forEach(row => row.reverse());
        if (amount === 3)             //anti-clockwise
            this._minos.reverse();

        this._rotation = mod(this._rotation + amount, 4)
    }

    move(changeX, changeY)
    {
        this._subPosition.x += changeX;
        this._subPosition.y += changeY;
        
        this.x += Math.floor(this._subPosition.x);
        this.y += Math.floor(this._subPosition.y);

        this._subPosition.x = mod(this._subPosition.x, 1);
        this._subPosition.y = mod(this._subPosition.y, 1);
    }
}

/**
 * rotates a piece with content to a board state
 * 
 * @param {FallingPiece} piece 
 * @param {Number} amount between 0 and 3
 * @param {Playfield} board 
 * @param {Object} kicktable 
 * 
 * @returns {FallingPiece | null} null if the rotation is unsucessful
 */
function rotateWithKicktable(piece, amount, board, kicktable)
{
    const kicktableType = kicktable[piece.type] === undefined 
    ? "*" : piece.type;
    const kicktableDirection = "" 
        + piece.rotation + mod(piece.rotation + amount, 4);
    const kickData = kicktable[kicktableType][kicktableDirection];

    for (let attempt = 0; attempt != kickData.length; ++attempt)
    {
        piece = piece.copy();
        piece.rotate(amount);
        piece.x += kickData[attempt].x;
        piece.y += kickData[attempt].y;

        if (!board.doesColide(piece))
            return piece;
    }

    return null;
}