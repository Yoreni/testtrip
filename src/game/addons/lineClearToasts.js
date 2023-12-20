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
                if (logic.combo > 1)
                {
                    const render = e.player.render
                    const comboText = new ComboIndicator(logic.combo);
                    comboText.x = -16 * 3.5
                    comboText.y = -16 * 12
                    render.playField.addChild(comboText)
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