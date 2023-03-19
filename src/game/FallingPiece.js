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
    O: [[0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]],
    S: [[0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]],
    T: [[0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]],
    Z: [[1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]]
}

class FallingPiece
{
    constructor(type)
    {
        this._minos = this._getMinos(type);
        this._rotation = 0;
        this._id = type;
        console.log(this._minos);
    }

    _getMinos(type)
    {
        let minos = [];

        //geting how much we need to move it by so its center is at 0, 0
        const centerTranslationY = Math.ceil(pieces[type].length / 2);
        const centerTranslationX = Math.ceil(pieces[type][0].length / 2);

        for (const [yIndex, yElement] of pieces[type].entries())
        {
            for (const [xIndex, xElement] of yElement.entries())
            {
                if (xElement === 1)
                    //pieces[type].length for x and y is to fix for the piece to be unsidedown and the wrong way round
                    //that is caused by how arrays are indexed
                    minos.push({
                        x: (pieces[type][0].length - xIndex) - centerTranslationX,
                        y: (pieces[type].length - yIndex) - centerTranslationY
                    });
            }
        }

        return minos;
    }
}