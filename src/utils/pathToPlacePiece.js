{
    /**
     * find the keypresses in order to a pieces in a certain way
     * 
     * @param {FallingPiece} desiredPiece 
     * @param {Playfield} board 
     * 
     * @returns {String[] | null} path to take
     * proform each action in order
     * 
     * possible actions are:
     * left - move piece left
     * right - move piece right
     * hd - harddrop
     * sd - softdrop down to the bottom
     * rc - rotate clockwise
     * rac - rotate anti clockwise
     * r180 - rotate 180
     * 
     * returns null if the piece if impossible to place there
     */
    function findPathToPlacePiece(desiredPiece, board)
    {
        if (board.doesColide(desiredPiece))
            return null;

        //const goal = findPieceCenter(desiredPiece)
        let moves = getPossibleMoves(board, desiredPiece.type);
        let vistied = []
        let log = []
        for (const piece of moves)
        {
            const pieceCenter = findPieceCenter(piece.piece)
            let actions = []

            if (piece.rotation !== 0)
                actions.push([null, "rc", "r180", "rac"][piece.rotation])
            

            if (pieceCenter.x > 5)
                actions.push(...Array(pieceCenter.x - 5).fill("right"))
            if (pieceCenter.x < 5)
                actions.push(...Array(5 - pieceCenter.x).fill("left"))

            // if (piece.rotation === desiredPiece.rotation)
            // {
            //     log.push(`${pieceCenter.x} ${pieceCenter.y} ${piece.rotation}
            //     ${pieceCenter.x === desiredPiece.x} ${pieceCenter.y === desiredPiece.y}
            //     ${desiredPiece.x} ${desiredPiece.y}`)
            // }

            if (pieceCenter.x === desiredPiece.x && pieceCenter.y === desiredPiece.y && piece.rotation === desiredPiece.rotation)
                return [...actions, "hd"]

            vistied.push({
                actions: [...actions, "sd"],
                piece: piece.piece,
                pieceCenter,
            })
        }

        let index = 0;
        while (index < vistied.length)
        {
            const move = vistied[index]

            if (move.actions.length > 20 || index > 10_000)
                return undefined; //timeout

            const nextMoves = {
                "left": movePiece(move.piece, board, -1),
                "right": movePiece(move.piece, board, 1),
                "rc": rotateWithKicktable(move.piece, 1, board, SRSkicktable),
                "rac": rotateWithKicktable(move.piece, 3, board, SRSkicktable),
                "r180": rotateWithKicktable(move.piece, 2, board, SRSkicktable),
            }

            for (let [actionName, piece] of Object.entries(nextMoves))
            {
                const nextMove =  vist(piece, vistied, move, actionName)
                if (nextMove !== null && isGoal(nextMove, desiredPiece))
                    return nextMove.actions
            }

            ++index;
        }

        // for (const line of log)
        //     console.log(line)


        return null;
    }

    /**
     * 
     * @param {FallingPiece} ogrinalPiece 
     * @param {Playfield} board used to verify if the piece is in a legal position
     * @param {Number}
     */
    const movePiece = (ogrinalPiece, board, amount) =>
    {
        let piece = ogrinalPiece.copy();
        piece.x += amount;

        if (board.doesColide(piece))
            return null
        return piece;
    }

    /**
     * 
     * @param {Object} state 
     * @param {FallingPiece} goal 
     * @returns {Boolean}
     */
    const isGoal = (state, goal) =>
    {
        return state.pieceCenter.x === goal.x 
            && state.pieceCenter.y === goal.y
            && state.piece.rotation === goal.rotation
    }

    /**
     * 
     * @param {FallingPiece} piece 
     * @param {Object[]} visitedList 
     * @param {Object} state 
     * @param {String} action 
     */
    const vist = (piece, visitedList, state, action) =>
    {
        if (piece !== null && !hasVisted(piece, visitedList))
        {
            const pieceCenter = findPieceCenter(piece);
            const actions = [...state.actions, action]
            // if (pieceCenter.x === desiredPiece.x && pieceCenter.y === desiredPiece.y && rightPiece.rotation === desiredPiece.rotation)
            //     return actions
            
            const newState = {
                actions,
                piece,
                pieceCenter: pieceCenter
            }

            visitedList.push(newState);
            return newState
        }

        return null
    }

    const hasVisted = (piece, visitedList) =>
    {
        for (const state of visitedList)
            return piece.x === state.piece.x 
                && piece.y === state.piece.y 
                && piece.rotation === state.piece.rotation;
    }

    let board = new Playfield(10, 20)
    // board.set(0, 0, "I")
    // board.set(1, 0, "I")
    // board.set(2, 0, "I")
    // board.set(3, 0, "I")
    // board.set(5, 0, "I")
    // board.set(6, 0, "I")
    // board.set(7, 0, "I")
    // board.set(8, 0, "I")
    // board.set(9, 0, "I")

    // board.set(0, 1, "I")
    // board.set(1, 1, "I")
    // board.set(2, 1, "I")
    // board.set(6, 1, "I")
    // board.set(7, 1, "I")
    // board.set(8, 1, "I")
    // board.set(9, 1, "I")

    // board.set(3, 2, "I")

    board.set(0, 0, "I")
    board.set(1, 0, "I")
    board.set(2, 0, "I")
    board.set(3, 0, "I")

    board.set(6, 0, "I")
    board.set(7, 0, "I")
    board.set(8, 0, "I")
    board.set(9, 0, "I")

    board.set(0, 1, "I")
    board.set(1, 1, "I")
    board.set(2, 1, "I")

    board.set(5, 1, "I")
    board.set(6, 1, "I")
    board.set(7, 1, "I")
    board.set(8, 1, "I")
    board.set(9, 1, "I")

    board.set(4, 2, "I")

    let piece = new FallingPiece("Z");
    piece.y = 0
    piece.x = 4

    setTimeout(() => {
        console.log(findPathToPlacePiece(piece, board))
    }, 1000)
}