const pieces = {
    I: [[0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]],
    J: [[1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]],
    L: [[0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]],
    O: [[1, 1],
        [1, 1]],
    S: [[0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]],
    T: [[0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]],
    Z: [[1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]],
    Y: [[0, 1, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]],
}

const pieceColours = {
    I: 0x3ffff2,
    J: 0x1928fc,
    L: 0xff7f1e,
    O: 0xffff21,
    S: 0x6bff21,
    T: 0xa32ae0,
    Z: 0xff2121,
    Y: 0x9faa66,
}

class FallingPiece
{
    constructor(type, x, y)
    {
        this._minos = deepCopy(pieces[type]);
        this._rotation = 0;
        this._type = type;
        this._position = Point(0, 0)
    }

    get x()
    {
        return this._position.x;
    }

    set x(newX)
    {
        this._position.x = newX;
    }

    get y()
    {
        return this._position.y;
    }

    set y(newY)
    {
        this._position.y = newY;
    }

    get type()
    {
        return this._type;
    }

    rotate(amount)
    {
        amount = mod(amount, 4);
        if (amount === 0)
            return;
        if (amount === 2)
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

        if (amount === 1)
            this._minos.forEach(row => row.reverse());
        if (amount === 3)
            this._minos.reverse();
        if (amount === 2)
        {
            this._minos.reverse();
            this._minos.forEach(row => row.reverse());
        }

        this._rotation = mod(this._rotation + amount, 4)
    }


    // rotate(amount)
    // {
    //     let rotationMatrix = []
    //     const newRotation = mod(this._rotation + amount, 4)

    //     switch (mod(newRotation - this._rotation, 4))
    //     {
    //         case 0:     //no rotation
    //             return;
    //         case 1:     //clockwise
    //             rotationMatrix = [[0, 1],[-1, 0]];
    //             break;
    //         case 2:     //180
    //             rotationMatrix = [[0, -1],[-1, 0]]
    //             break;
    //         case 3:     //anti-clockwise
    //             rotationMatrix = [[0, -1],[1, 0]]
    //             break;
    //     }
        
    //     for (let [index, mino] of this._minos.entries())
    //     {
    //         let newX = (rotationMatrix[0][0] * mino.x) + (rotationMatrix[0][1] * mino.y);
    //         let newY = (rotationMatrix[1][0] * mino.x) + (rotationMatrix[1][1] * mino.y);
    //         this._minos[index] = {
    //             x: newX,
    //             y: newY
    //         };
    //     }

    //     this._rotation = newRotation;
    // }

    get minos()
    {
        let minos = [];

        //geting how much we need to move it by so its center is at 0, 0
        const centerTranslationY = Math.ceil(this._minos.length / 2);
        const centerTranslationX = Math.ceil(this._minos[0].length / 2);

        for (const [yIndex, yElement] of this._minos.entries())
        {
            for (const [xIndex, xElement] of yElement.entries())
            {
                if (xElement === 1)
                    //this._minos.length - 1 for y is to fix for the piece to be unsidedown
                    //that is caused by how arrays are indexed
                    minos.push({
                        x: xIndex - centerTranslationX + this.x,
                        y: this._minos.length - 1 - yIndex - centerTranslationY + this.y
                    });
            }
        }

        return minos;
    }
}