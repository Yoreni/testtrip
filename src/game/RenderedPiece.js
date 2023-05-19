class RenderedPiece extends PIXI.Container
{
    static pool = new ObjectPool(100 * 4);

    constructor(fallingPiece)
    {
        super();
        this.updatePiece(fallingPiece);
    }

    clear()
    {
        this.updatePiece(null);
    }

    updatePiece(newFallingPiece)
    {
        if (newFallingPiece == null)
        {
            this.visible = false;
            return;
        }
        this.visible = true;

        if(typeof(newFallingPiece) === "string")
            newFallingPiece = new FallingPiece(newFallingPiece);

        const texture = currentSkin === null 
                    ? PIXI.Texture.from(`assets/${newFallingPiece.type}.png`) 
                    : currentSkin.getTexture(newFallingPiece.type);
        const iterations = Math.max(newFallingPiece.minos.length, this.children.length);

        for (let index = 0; index !== iterations; ++index)
        {
            if (index >= this.children.length)              
                this.addChild(RenderedPiece.pool.borrow());

            let child = this.children[index];
            if (index >= newFallingPiece.minos.length)
            {
                child.visible = false;
                continue;
            }

            child.visible = true;
            child.texture = texture;
            child.scale.set(16 / texture.width);
            let mino = newFallingPiece.minos[index];
            child.x = ((mino.x - newFallingPiece.x) * 16);
            child.y = ((mino.y - newFallingPiece.y) * -16);
        }
    }
}