{
    const making = "secretGrade";

    const expressionMatchesMinoType = function(minoType, expression)
    {
        if (expression === "*") //wildcard
            return true;
        
        if (expression.includes("|")) //or
        {
            const expressions = expression.split("|");
            const result = expressions.map((exp) => expressionMatchesMinoType(minoType, result));
            return result.includes(true);
        }

        if (expression[0] === "!")  //negation
            return expression.substring(1) !== minoType;

        return minoType === expression
    }

    const sectionOfPlayfieldMatchesPattern = function(playfield, pattern, playfieldX, playfieldY)
    {
        let patternRows = pattern.length;
        let patternColumns = pattern[0].length;

        let found = true;
        for (let patternY = 0; patternY != patternRows; ++patternY)
        {
            for (let patternX = 0; patternX != patternColumns; ++patternX)
            {
                const expression = pattern[patternY][patternX];
                const minoType = playfield.get(playfieldX + patternX, playfieldY + patternY)
                if (!expressionMatchesMinoType(minoType, expression))
                {
                    found = false;
                    break;
                }
            }

            if (!found)
                break;
        }

        return found;
    }

    const findPatternInPlayfield = function(playfield, pattern)
    {
        pattern = pattern.reverse();
        let patternRows = pattern.length;
        let patternColumns = pattern[0].length;

        let matches = [];

        for (let x = 0; x != playfield.width - patternColumns + 1; ++x)
        {
            for (let y = 0; y != (playfield.height + 10) - patternRows + 1; ++y)
            {
                const match = sectionOfPlayfieldMatchesPattern(playfield, pattern, x, y);
                if (match)
                    matches.push(Point(x, y));
            }
        }

        return matches;
    }

    const secretGrade = [["!0","*", "*","*", "*", "*", "*", "*", "*", "*"],
                         ["0","!0", "!0","!0", "!0", "!0", "!0", "!0", "!0", "!0"],
                         ["!0","0", "!0","!0", "!0", "!0", "!0", "!0", "!0", "!0"],
                         ["!0","!0", "0","!0", "!0", "!0", "!0", "!0", "!0", "!0"],
                         ["!0","!0", "!0","0", "!0", "!0", "!0", "!0", "!0", "!0"],
                        ["!0","!0", "!0","!0", "0", "!0", "!0", "!0", "!0", "!0"],
                        ["!0","!0", "!0","!0", "!0", "0", "!0", "!0", "!0", "!0"],
                        ["!0","!0", "!0","!0", "!0", "!0", "0", "!0", "!0", "!0"],
                        ["!0","!0", "!0","!0", "!0", "!0", "!0", "0", "!0", "!0"],
                        ["!0","!0", "!0","!0", "!0", "!0", "!0", "!0", "0", "!0"],
                        ["!0","!0", "!0","!0", "!0", "!0", "!0", "!0", "!0", "0"],
                        ["!0","!0", "!0","!0", "!0", "!0", "!0", "!0", "0", "!0"],
                        ["!0","!0", "!0","!0", "!0", "!0", "!0", "0", "!0", "!0"],
                        ["!0","!0", "!0","!0", "!0", "!0", "0", "!0", "!0", "!0"],
                        ["!0","!0", "!0","!0", "!0", "0", "!0", "!0", "!0", "!0"],
                        ["!0","!0", "!0","!0", "0", "!0", "!0", "!0", "!0", "!0"],
                        ["!0","!0", "!0","0", "!0", "!0", "!0", "!0", "!0", "!0"],
                        ["!0","!0", "0","!0", "!0", "!0", "!0", "!0", "!0", "!0"],
                        ["!0","0", "!0","!0", "!0", "!0", "!0", "!0", "!0", "!0"],
                        ["0","!0", "!0","!0", "!0", "!0", "!0", "!0", "!0", "!0"]];

    const VerticlI = new Array(20).fill(["I"])
    const emptyColum = new Array(20).fill(["0"])

    const floater = (minoType) => 
    [
        ["*", "*", "*", "*", "*", "*", "*", "0", "0", "0"],
        ["*", "*", "*", "*", "*", "*", "*", "0", minoType, "0"],
        ["*", "*", "*", "*", "*", "*", "*", "0", "0", "0"],
    ]

    //for the negative tetraminos challange
    const negT =
    [
        ["*", "*" , "!0", "*" , "*"],
        ["*", "!0", "0" , "!0", "*"],
        ["*", "0" , "0" , "0" , "!0"],
        ["*", "!0", "!0", "!0", "*"],
    ]

    //TODO: to add
    // - negtive tetraminos
    // - reverse secret-grade
    // - Big-X
    const artConditions = 
    {
        //detects both greater and lesser varients
        secretGrade: (board) => findPatternInPlayfield(board, secretGrade).length === 1 || 
                                findPatternInPlayfield(board, secretGrade.map(row => row.reverse())).length === 1,
        verticleLine: (board) => findPatternInPlayfield(board, VerticlI).length === 1 &&
                                 findPatternInPlayfield(board, emptyColum).length === 9,
        floaters: (board) => ["S","Z", "I", "T", "J", "L"]
                                .map(mino => findPatternInPlayfield(board, floater(mino)).length === 1)
                                .every(value => value === true)
    }

    modeManager.register("tetraminoArt",
    {
        render: class extends PlayerRenderer
        {
            _updateStats()
            {
                let display = ["Time"];
                super._updateStats(display);
            }
        },
        events:
        {
            onPiecePlace: (e) =>
            {
                if (artConditions[making](e.player.board))
                    alert("You did it");
            }
        },
        gameRules:
        {
            gravity: 0
        }
    });
}
