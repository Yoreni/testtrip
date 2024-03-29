class RenderedPiece extends PIXI.Container
{
    static pool = new ObjectPool(100 * 4);

    #size

    constructor(fallingPiece)
    {
        super();
        this.#size = 16;
        this.updatePiece(fallingPiece);
    }

    get size()
    {
        return this.#size;
    }

    /**
     * @param {Number} newSize Number > 0
     */
    set size(newSize)
    {
        if (newSize <= 0)
        {
            console.error(`can not set size to ${newSize}`)
            return;
        }

        this.#size = newSize;
    }

    clear()
    {
        this.updatePiece(null);
    }

    updatePiece(newFallingPiece)
    {
        if (currentSkin === null)
            return;

        if (newFallingPiece == null)
        {
            this.visible = false;
            return;
        }
        this.visible = true;

        if(typeof(newFallingPiece) === "string")
            newFallingPiece = new FallingPiece(newFallingPiece);

        const texture = currentSkin.getTexture(newFallingPiece.type);
        const iterations = Math.max(newFallingPiece.minos.length, this.children.length);

        for (let index = 0; index !== iterations; ++index)
        {
            if (index >= this.children.length)   //TODO we need to return them as well           
                this.addChild(RenderedPiece.pool.borrow());

            let child = this.children[index];
            if (index >= newFallingPiece.minos.length)
            {
                child.visible = false;
                continue;
            }

            child.visible = true;
            child.texture = texture;
            child.scale.set(this.#size / texture.width);
            let mino = newFallingPiece.minos[index];
            child.x = ((mino.x - newFallingPiece.x) * this.#size);
            child.y = ((mino.y - newFallingPiece.y) * -this.#size);
        }
    }

    destroy()
    {
        for (const child of this.children)
            RenderedPiece.pool.return(child);
        this.removeChildren();
    }
}