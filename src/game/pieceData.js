const pieces = {
    //Tetraminos
    I: {
        shape:
            [[0, 0, 0, 0],
             [1, 1, 1, 1],
             [0, 0, 0, 0],
             [0, 0, 0, 0]],
        colour: 0x3ffff2,
        center: Point(1.5, 1.5),
    },
    J: {
        shape:
            [[1, 0, 0],
             [1, 1, 1],
             [0, 0, 0]],
        colour: 0x1928fc,
        center: Point(1, 1)
    },
    L: {
        shape: 
            [[0, 0, 1],
             [1, 1, 1],
             [0, 0, 0]],
        colour: 0xff7f1e,
        center: Point(1, 1)
    },
    O: {
        shape: 
            [[1, 1],
             [1, 1]],
        colour: 0xffff21,
        center: Point(0.5, 0.5)
    },
    S: {
        shape: [[0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]],
        colour: 0x6bff21,
        center: Point(1, 1)
    },
    T: {
        shape:
            [[0, 1, 0],
             [1, 1, 1],
             [0, 0, 0]],
        colour: 0xa32ae0,
        center: Point(1, 1),
        primaryCorners: [Point(-1, 1), Point(1, 1)],
        secondaryCorners: [Point(-1, -1), Point(1, -1)],
    },
    Z: {
        shape:
            [[1, 1, 0],
             [0, 1, 1],
             [0, 0, 0]],
        colour: 0xff2121,
        center: Point(1, 1)
    },
    // //Pentaminos
    // S5: [[0, 1, 1],
    //      [0, 1, 0],
    //      [1, 1, 0]], 
    // Z5: [[1, 1, 0],
    //      [0, 1, 0],
    //      [0, 1, 1]],
    // P:  [[0, 1, 1],
    //      [1, 1, 1],
    //      [0, 0, 0]],
    // Q:  [[1, 1, 0],
    //      [1, 1, 1],
    //      [0, 0, 0]],
    // F : [[0, 1, 0],
    //      [1, 1, 1],
    //      [0, 0, 1]],
    // E : [[0, 1, 0],
    //      [1, 1, 1],
    //      [1, 0, 0]],
    // T5: [[0, 1, 0],
    //      [0, 1, 0],
    //      [1, 1, 1]],
    // U:  [[1, 0, 1],
    //      [1, 1, 1],
    //      [0, 0, 0]],
    // V:  [[1, 0, 0],
    //      [1, 0, 0],
    //      [1, 1, 1]],
    // W:  [[1, 0, 0],
    //      [1, 1, 0],
    //      [0, 1, 1]],
    // X:  [[0, 1, 0],
    //      [1, 1, 1],
    //      [0, 1, 0]],
    // J5: [[0, 0, 0, 0],
    //      [1, 0, 0, 0],
    //      [1, 1, 1, 1],
    //      [0, 0, 0, 0]],
    // L5: [[0, 0, 0, 0],
    //      [0, 0, 0, 1],
    //      [1, 1, 1, 1],
    //      [0, 0, 0, 0]],
    // R:  [[0, 0, 0, 0],
    //      [0, 0, 1, 0],
    //      [1, 1, 1, 1],
    //      [0, 0, 0, 0]],
    // Y:  [[0, 0, 0, 0],
    //      [0, 1, 0, 0],
    //      [1, 1, 1, 1],
    //      [0, 0, 0, 0]],
    // N:  [[0, 0, 0, 0],
    //      [1, 1, 0, 0],
    //      [0, 1, 1, 1],
    //      [0, 0, 0, 0]],
    // H:  [[0, 0, 0, 0],
    //      [0, 0, 1, 1],
    //      [1, 1, 1, 0],
    //      [0, 0, 0, 0]],
    I5:  {
        shape: [[0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [1, 1, 1, 1, 1],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0]],
        center: Point(2.5, 2.5)},
    // //M123
    // 1: [[1]],
    // I2: [[1, 1],
    //      [0, 0]],
    // I3: [[0, 0, 0],
    //      [1, 1, 1],
    //      [0, 0, 0]],
    // C: [[1, 0],
    //     [1, 1]],
    // //Wired Pieces
    // O8: [[1, 1, 1],
    //      [1, 0, 1],
    //      [1, 1, 1]],
    // I10: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
    //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
    //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
    //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
    //       [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 
    //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
    //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
    //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
    //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
    //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
    // rH: [[1, 0, 1],
    //      [1, 1, 1],
    //      [1, 0, 1]],
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

/**
 * 
 * @param {String} pieceType 
 * @param {Number} rotation int between 0 and 3
 * @returns 
 */
function getPieceCorners(pieceType, rotation)
{
    if (pieces[pieceType]?.primaryCorners === null || pieces[pieceType]?.secondaryCorners === null)
        return null;

    let primaryCorners = deepCopy(pieces[pieceType].primaryCorners)
    let secondaryCorners = deepCopy(pieces[pieceType].secondaryCorners)

    rotation = mod(rotation, 4)
    let rotationMatrix = []
    if (rotation === 0)
        return {primary: primaryCorners, secondary: secondaryCorners}

    switch (rotation)
    {
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

    const matrixRotation = (corner) => Point(
        (rotationMatrix[0][0] * corner.x) + (rotationMatrix[0][1] * corner.y),
        (rotationMatrix[1][0] * corner.x) + (rotationMatrix[1][1] * corner.y))

    primaryCorners = primaryCorners.map(matrixRotation)
    secondaryCorners = secondaryCorners.map(matrixRotation)
    return {primary: primaryCorners, secondary: secondaryCorners}
}
