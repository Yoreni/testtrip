{
    let actions = null;

    modeManager.register("dev",
    {
        render: class extends PlayerRenderer
        {
            _updateStats()
            {
                let display = ["Time", "PPS"];
                super._updateStats(display);
            }

            _setupComponents()
            {
                super._setupComponents();

                this._objects.pieceCentre = new PIXI.Graphics();
                this._objects.pieceCentre.beginFill(0xFF0000);
                this._objects.pieceCentre.drawCircle(0, 0, 6);
                this._objects.pieceCentre.endFill();
                this.container.addChild(this._objects.pieceCentre);

                this._objects.pieceText = new PIXI.Text();
                this._objects.pieceText.style.fill = 0xAAAAAA
                this.container.addChild(this._objects.pieceText);

                this._objects.botCommond = new PIXI.Graphics();
                this._objects.botCommond.beginFill(0x0000FF);
                this._objects.botCommond.drawCircle(0, 0, 6);
                this._objects.botCommond.endFill();
                this.container.addChild(this._objects.botCommond);
            }

            update(delta)
            {
                // if (this._objects.botCommond === undefined)
                //     return;
                // if (misaminoPoint === undefined)
                //     return;
                // this._objects.botCommond.position.set(((misaminoPoint.x + 1) * 16) - 8,((misaminoPoint.y + 0) * -16) - 8)

                // if (actions === null)
                // {
                //     actions = findPathToPlacePiece(misaminoPoint, this._logicPlayer.board);
                //     console.log(`Path: ${actions}`)
                // }
            }

            _drawFallingPiece()
            {
                super._drawFallingPiece();
                const piece = this._logicPlayer.currentPiece;

                if (this._objects.pieceCentre === undefined)
                    return;

                this._objects.pieceCentre.position.set(((piece.x + 1) * 16) - 8,((piece.y + 0) * -16) - 8)
                this._objects.pieceText.position.set(((piece.x + 0) * 16) - 8,((piece.y + 3) * -16) - 8)
                this._objects.pieceText.text = `X: ${piece.x}, Y: ${piece.y}`;
            }
        },
        events:
        {
            onPiecePlace: (e) =>
            {
                actions = null;
            }
        },
        gameRules:
        {
            gravitiy: 0,
            lockDelay: 3999999990,
            maxLockResets: 9999999,
        }   
    });
}
