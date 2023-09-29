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
        const query = linesCleared + "line" + (spinType === SpinType.FULL ? "TS" : "");
        return attackTable[query]
            + (logicPlayer.combo < comboTable.length ? comboTable[logicPlayer.combo] : comboTable.at(-1))   //combo bonus
            + (logicPlayer._stats.b2b > 0 ? 1 : 0);                                                          //b2b bonus
    }

    const handleAttack = (player, target, amount) =>
    {
        player._stats.attack += amount;                       //update attack stat

        //attack removes our own incoming attack first
        const absorbed = amount - absorbIncomingAttack(player, amount);
        const sent = amount - absorbed;

        if (sent > 0)
        {
            target.logic.garbageIncoming += sent;

            //spike counter
            if (player._stats.lastAttack === undefined || new Date() - player._stats.lastAttack > 2000)
                player.currentSpike = sent;
            else
                player.currentSpike += sent;
            player._stats.lastAttack = new Date();
       }

        return {absorbed, sent}
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

            getPlayerStat(statName)
            {
                const apm = this._logicPlayer._stats.attack / this._logicPlayer.time * 60
                if (statName === "APM")
                    return apm.toFixed(apm < 9.95 ? 2 : apm < 99.5 ? 1 : 0);
                if (statName === "VS Score")
                    return  "Not implemented";
                if (statName === "Attack")
                    return  this._logicPlayer._stats.attack;
                return super.getPlayerStat(statName)
            }

            _updateStats()
            {
                let display = ["PPS", "Time", "APM", "VS Score", "Attack"];
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
                e.player.logic._stats.attack = 0;
                e.player.logic.garbageIncoming = 0;
                e.player.logic.currentSpike = 0;
                e.player.render.drawIncomingAttack();
            },
            onPieceLock: (e) =>
            {
                const completedLines = e.oldBoard.completedLines.length
                const logicPlayer = e.player.logic;
                const render = e.player.render

                if (completedLines > 0)
                {
                    let attack = calculateDamgeDealt(logicPlayer, completedLines, e.spinType);

                    const target = e.player.otherPlayers[randInt(0, e.player.otherPlayers.length - 1)]
                    let {absorbed, sent} = handleAttack(logicPlayer, target, attack);
                    const picePosition = Point((logicPlayer.currentPiece.x - 1) * 16, (logicPlayer.currentPiece.y + 1) * -16)

                    if (absorbed > 0)
                    {
                        render.drawIncomingAttack();
                        new NumberPopup(render.container, absorbed, 0x07a9f4, picePosition);
                    }
                    if (sent > 0)
                    {
                        target.render.drawIncomingAttack();
                        if (sent != logicPlayer.currentSpike)          // delete the old damage indicater if we are in the same spike
                            render._objects.attackIndicator.text.alpha = 0;
                        render._objects.attackIndicator = 
                            new NumberPopup(render.container, logicPlayer.currentSpike, 0xf4f007, picePosition);
                    }
                }
                else if (logicPlayer.garbageIncoming > 0)
                {
                    reciveIncomingGarbage(logicPlayer);
                    render.drawIncomingAttack();
                }
            }
        },
        gameRules: {
            hold: 1
        },
        addons: ["backToBack"],
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
