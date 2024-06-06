{
    const attackTable = {
        "1line": 0,
        "2line": 1,
        "3line": 2,
        "4line": 4,
        "1lineTS": 2,
        "2lineTS": 4,
        "3lineTS": 6,
        "4lineTS": 8,
        "perfectClear": 10,
    }
    const comboTable = [0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4];
    const garbageCap = 6;
    const incomingAttackColours = [0xFF0000, 0xf9f90e, 0x24f204, 0x04e6f2, 0x0f07f9, 0xef04e7]

    const absorbIncomingAttack = (player, amount) =>
    {
        const remainingAttack = Math.max(0, amount - player.garbageIncoming);
        player.garbageIncoming = Math.max(0, player.garbageIncoming - amount);
        return remainingAttack;
    }

    const calculateDamgeDealt = (logicPlayer, linesCleared, spinType) =>
    {
        const isTSpin = spinType === SpinType.FULL && logicPlayer.currentPiece.type === "T"
        const query = linesCleared + "line" + (isTSpin ? "TS" : "");
        return attackTable[query]
            + (logicPlayer.combo < comboTable.length ? comboTable[logicPlayer.combo] : comboTable.at(-1))   //combo bonus
            + (logicPlayer.stats.b2b > 0 ? 1 : 0);                                                          //b2b bonus
    }

    const handleAttack = (player, target, amount) =>
    {
        player.stats.attack += amount;                       //update attack stat

        //attack removes our own incoming attack first
        const absorbed = amount - absorbIncomingAttack(player, amount);
        const sent = amount - absorbed;

        if (sent > 0)
        {
            target.logic.garbageIncoming += sent;

            //spike counter
            if (player.stats.lastAttack === undefined || new Date() - player.stats.lastAttack > 1500)
                player.currentSpike = sent;
            else
                player.currentSpike += sent;
            player.stats.lastAttack = new Date();
       }

        return {absorbed, sent}
    }

    const updateRendersAfterAttack = (attacker, target, attack) =>
    {
        const {absorbed, sent} = attack;
        const picePosition = Point((attacker.logic.currentPiece.x - 1) * 16, (attacker.logic.currentPiece.y + 1) * -16);

        console.log(sent)
        if (absorbed > 0)
        {
            attacker.render.drawIncomingAttack();
            new NumberPopup(attacker.render.container, absorbed, 0x07a9f4, picePosition);
        }
        if (sent > 0)
        {
            target.render.drawIncomingAttack();
            if (sent != attacker.logic.currentSpike)          // hide the old damage indicater if we are in the same spike
                attacker.render._objects.attackIndicator.text.alpha = 0;
            attacker.render._objects.attackIndicator = 
                new NumberPopup(attacker.render.container, attacker.logic.currentSpike, 0xf4f007, picePosition);
        }
    }

    const reciveIncomingGarbage = (logicPlayer) =>
    {
        const amountToAdd = Math.min(logicPlayer.garbageIncoming, garbageCap)
        logicPlayer.garbageIncoming -= amountToAdd;
        addGarbage(logicPlayer.board, randInt(0, logicPlayer.board.width - 1), amountToAdd)
    }

    modeManager.register("versus",
    {
        render: class extends PlayerRenderer
        {
            _setupComponents()
            {
                super._setupComponents();

                this._objects.incomingAttack = new PIXI.Graphics();
                this._objects.incomingAttack.x = -12;
                this._objects.incomingAttack.visible = true;
                this.playField.addChild(this._objects.incomingAttack)

                this._objects.attackIndicator = null;

                this._objects.statsDisplay.x -= 12
            }

            _updateStats()
            {
                let display = ["PPS", "time", "APM", "vsScore"];
                super._updateStats(display);
            }

            drawIncomingAttack()
            {
                this._objects.incomingAttack.clear();

                const maxHeight = this._logicPlayer.board.height * 16;
                const height = (this._logicPlayer.garbageIncoming * 16) % maxHeight;

                const colourIndex = Math.floor(this._logicPlayer.garbageIncoming / this._logicPlayer.board.height);
                const backgroundColourIndex = colourIndex - 1;

                if (backgroundColourIndex >= 0)
                {
                    this._objects.incomingAttack.beginFill(incomingAttackColours[backgroundColourIndex]);
                    this._objects.incomingAttack.drawRect(0, -maxHeight, 12, maxHeight)
                    this._objects.incomingAttack.endFill();
                }


                this._objects.incomingAttack.beginFill(incomingAttackColours[colourIndex]);
                this._objects.incomingAttack.drawRect(0, -height, 12, height)
                this._objects.incomingAttack.endFill();
            }
        },
        events: 
        {
            onGameStart: (e) =>
            {
                e.player.otherPlayers = e.players.filter((player) => e.player.logic.id !== player.logic.id)
                e.player.logic.stats.attack = 0;
                e.player.logic.garbageIncoming = 0;
                e.player.logic.currentSpike = 0;
                e.player.logic.stats.garbageCleared = 0;
                e.player.render.drawIncomingAttack();
            },
            onPieceLock: (e) =>
            {
                const completedLines = e.oldBoard.completedLines.length
                const logicPlayer = e.player.logic;
                const render = e.player.render

                // count cleared garbage lines
                for (let line of e.oldBoard.completedLines)
                {
                    if (e.oldBoard.get(0, line) === "#" || e.oldBoard.get(1, line) === "#")
                        ++(e.player.logic.stats.garbageCleared);
                }

                let newBoard = e.oldBoard.copy()
                newBoard.clearLines(e.oldBoard.completedLines)

                if (completedLines > 0)
                {
                    let attack = calculateDamgeDealt(logicPlayer, completedLines, e.spinType) + (newBoard.isPc ? attackTable["perfectClear"] : 0);
                    const target = e.player.otherPlayers[randInt(0, e.player.otherPlayers.length - 1)]
                    const attackResult = handleAttack(logicPlayer, target, attack);
                    updateRendersAfterAttack(e.player, target, attackResult);
                }
                else if (logicPlayer.garbageIncoming > 0)
                {
                    reciveIncomingGarbage(logicPlayer);
                    render.drawIncomingAttack();
                }
            }
        },
        gameRules: {
            hold: 1,
        },
        load: (modeOptions, rules) => 
        {
            rules.hold = 1;
            rules.seed = modeOptions.seed ?? new Date().getTime()

            PlayerRenderer.addStat("APM", (player) => {
                const apm = player.stats.attack / player.time * 60
                return apm.toFixed(apm < 9.95 ? 2 : apm < 99.5 ? 1 : 0);
            });
            PlayerRenderer.addStat("vsScore", (player) => {
                const vsScore = ((player.stats.attack + player.stats.garbageCleared)
                        / player.piecesPlaced) * player.pps * 100;
            
                return  Number.isNaN(vsScore) ? (0).toFixed(2) : vsScore.toFixed(vsScore < 9.95 ? 2 : vsScore < 99.5 ? 1 : 0);
            });
            PlayerRenderer.addStat("attack", (player) => player.stats.attack);
        },
        addons: ["backToBack", "lineClearToasts"],
        endCondition: (alivePlayers) => alivePlayers === 1,
    });

    class NumberPopup
    {
        constructor(container, text, fillColour, pos = Point(0, -150))
        {
            this.container = container
            this.text = new PIXI.Text(text, textStyle(30))
            this.text.style.fill = fillColour;
            this.text.position.set(pos.x, pos.y);
            this.container.addChild(this.text)
            this.tickerFunction = this.update.bind(this)
            app.ticker.add(this.tickerFunction)
            this.count = 0;
            
            const direction = Math.random() * Math.PI * 2;
            this.xVel = Math.sin(direction) * 1.5;
            this.yVel = Math.cos(direction) * 1.5;
        }

        update(delta)
        {
            if (this.text.alpha > 0)
            {
                this.text.alpha -= 0.01;
                this.text.x += this.xVel;
                this.text.y += this.yVel;
            }
            else
                app.ticker.remove(this.tickerFunction)
            ++(this.count)
        }
    }
}
