{
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
                //this._objects.pieceCentre.pivot.set(3, 3);

            }

            _drawFallingPiece()
            {
                super._drawFallingPiece();
                const piece = this._logicPlayer.currentPiece;

                if (this._objects.pieceCentre === undefined)
                    return;

                this._objects.pieceCentre.position.set(((piece.x - 1) * 16) - 8,((piece.y + 0) * -16) - 8)
                this._objects.pieceText.position.set(((piece.x + 0) * 16) - 8,((piece.y + 3) * -16) - 8)
                this._objects.pieceText.text = `X: ${piece.x}, Y: ${piece.y}`;
            }
        },
        events:
        {
            onPiecePlace: (e) =>
            {

            }
        },
        gameRules:
        {
            gravitiy: 0,
        }   
    });
}
