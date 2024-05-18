{
    class PerfectClearText extends PIXI.Container
    {
        constructor()
        {
            super()
            app.ticker.add(this.#update.bind(this))
            let style = textStyle(36)
            style.fill = "#FFFFFF"
            this.text = new PIXI.Text("PERFECT\nCLEAR", style)
            this.text.pivot.x = this.text.width / 2
            this.text.pivot.y = this.text.height / 2
            this.visible = true;
            this.angle = 90
            this.addChild(this.text)
        }

        #update(delta)
        {
            if (this.text.alpha > 0)
            {
                if (this.angle > 0)
                    this.angle -= 15
                else
                    this.text.alpha -= 0.0075;
            }
            else
            {
                app.ticker.remove(this.#update)
                this.visible = false;
                this.destroy()
            }
        }
    }

    class ComboIndicator extends PIXI.Container
    {
        constructor(comboCount)
        {
            super()
            app.ticker.add(this.#update.bind(this))
            this.timer = 0;

            let trapisium = new PIXI.Graphics()
            trapisium.y = -10
            const bottomLength = 45
            trapisium.beginFill(0x46b7ce)
            trapisium.lineTo(bottomLength - 15, 0)
            trapisium.lineTo(bottomLength, 40)
            trapisium.lineTo(-bottomLength, 40)
            trapisium.lineTo(-bottomLength + 15, 0)
            trapisium.endFill()
            this.addChild(trapisium)

            let style = textStyle(28)
            style.fill = "#fcf811"
            this.text = new PIXI.Text(comboCount, style)
            this.text.pivot.x = this.text.width / 2
            this.text.pivot.y = this.text.height / 2
            this.addChild(this.text)

            let comboStyle = textStyle(20)
            comboStyle.fill = "#fcf811"
            let comboText = new PIXI.Text("combo", comboStyle)
            comboText.pivot.x = comboText.width / 2
            comboText.pivot.y = comboText.height / 2 - 20
            this.addChild(comboText)
        }

        #update(delta)
        {
            if (this.text.alpha > 0 && this.timer > 20)
            {
                this.alpha -= 0.15;
            }
            else
            {
                this.text.y = Math.sin(this.timer / Math.PI / 2) * 6
            }

            ++(this.timer)
        }

        destroy()
        {
            app.ticker.remove(this.#update)
            this.visible = false;
            super.destroy();
        }
    }

    class LineClearText extends PIXI.Container
    {
        static lineClearText = ["","single", "double", "triple", "quadruple", "quintuple", "sextuple", "septuple", "octuple", "nonuple", "dectuple"]

        /**
         * 
         * @param {Number} linesCleared greater than 0
         * @param {Number} b2b 
         * @param {SpinType} spinType
         * @param {String} type of piece
         */
        constructor(linesCleared, b2b, spinType, pieceType)
        {
            super()
            app.ticker.add(this.#update.bind(this))
            this.timer = 0

            if (spinType != SpinType.NONE)
            {
                let style = saveOptionsWithDeafults({
                    // dropShadow: true,
                    // dropShadowAngle: 9,
                    // dropShadowBlur: 1,
                    // dropShadowColor: "#2e2e2e",
                    // dropShadowDistance: 2,
                    fill: pieces[pieceType].colour
                },textStyle(24))
                let translationKey = spinType === SpinType.MINI ? "gameHud.spinMini" : "gameHud.spin";
                let b2bText = new PIXI.Text(langManager.get(translationKey, pieceType), style)
                b2bText.pivot.x = b2bText.width / 2
                b2bText.pivot.y = (b2bText.height / 2)
                b2bText.y -= 16
                this.addChild(b2bText)
            }

            if (b2b > 1)
            {
                let b2bFill = saveOptionsWithDeafults({
                    // dropShadow: true,
                    // dropShadowAngle: 9,
                    // dropShadowBlur: 1,
                    // dropShadowColor: "#2e2e2e",
                    // dropShadowDistance: 2,
                    fill: "#f79d02"
                },textStyle(24))
                let b2bTextContent = b2b == 2 ? langManager.get("gameHud.backToBack") : langManager.get("gameHud.backToBackCombo", b2b - 1)
                let b2bText = new PIXI.Text(b2bTextContent, b2bFill)
                b2bText.pivot.x = b2bText.width / 2
                b2bText.pivot.y = b2bText.height / 2
                b2bText.y = -18
                b2bText.x = -5
                if (spinType != SpinType.NONE)  //ensures the spin text and b2b text doesnt overlap
                {
                    b2bText.y -= 18
                }
                this.addChild(b2bText)
            }

            const fill = linesCleared <= 4 ? ["#2e2e2e", "#64d178", "#64d1a7", "#12e8af", "#0cf4f4"][linesCleared] : "#6dcfe8"
            let style = saveOptionsWithDeafults({
                dropShadow: true,
                dropShadowAngle: 9,
                dropShadowBlur: 1,
                dropShadowColor: "#2e2e2e",
                dropShadowDistance: 2,
                fill: fill
            },textStyle(28))
            this.text = new PIXI.Text(langManager.get(`gameHud.${linesCleared}LineClear`), style)
            this.text.pivot.x = this.text.width / 2
            this.text.pivot.y = this.text.height / 2
            this.addChild(this.text)
        }

        #update(delta)
        {
            if (this.alpha > 0)
            {
                if (this.timer > 30)
                    this.alpha -= 0.0075;
            }
            else
            {
                app.ticker.remove(this.#update)
                this.visible = false;
                this.destroy()
            }

            ++(this.timer)
        }
    }


    const addon = 
    {
        onAdd: () =>
        {    

        },
        events:
        {
            onPieceLock: (e) =>
            {
                const logic = e.player.logic
                const render = e.player.render
                if (logic.combo > 1)
                {
                    const comboText = new ComboIndicator(logic.combo);
                    comboText.x = -16 * 3.5
                    comboText.y = -16 * 12
                    render.playField.addChild(comboText)
                }

                if (e.clearedLines > 0)
                {
                    const lineClearText = new LineClearText(e.clearedLines, logic._stats.b2b ?? 0,
                         e.spinType, logic.currentPiece.type)
                    lineClearText.x = -16 * 4
                    lineClearText.y = -16 * 14
                    render.playField.addChild(lineClearText)
                }


            },
            onPiecePlace: (e) =>
            {
                if (e.player.logic.board.isPc)
                {
                    const render = e.player.render
                    const perfectClearText = new PerfectClearText();
                    console.log(render._objects.board)
                    perfectClearText.y -= 16 * 10//render._objects.board.height / 2
                    perfectClearText.x += 16 * 5
                    render.playField.addChild(perfectClearText)
                }
            },
        }
    }

    addonMangaer.register("lineClearToasts", addon);
}