{

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
        events: () =>
        {
            eventManager.addEvent("onPiecePlace", (e) =>
            {
                const pattern = [["J", "J", "J"], 
                                 ["O", "O", "J"],
                                 ["O", "O", "L"],
                                 ["L", "L", "L"]];
                
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

                const tki = [
                            ["*","*" , "*" ,"!0", "*" , "!0", "!0", "*", "*" , "!0"],
                            ["!0" ,"!0", "!0","!0", "!0", "!0", "0" , "0", "0" , "!0"],
                            ["!0","!0" , "!0","!0", "!0", "!0", "!0", "0", "!0", "!0"]
                    
            ]
                //check for the board state here
                console.log("Matches:", findPatternInPlayfield(e.player.board, tki).length);
            })
        },
    });

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

}
