class RenderedPiece extends PIXI.Container
{
    static pool = new ObjectPool(100 * 4);

    constructor(fallingPiece)
    {
        super();
        const texture = PIXI.Texture.from(`assets/${fallingPiece.type}.png`);
        for (let mino of fallingPiece.minos)
        {
            let minoSprite = RenderedPiece.pool.borrow()
            minoSprite.texture =  texture
            minoSprite.scale.set(16 / texture.width);
            minoSprite.x = ((mino.x - fallingPiece.x) * 16) + 100 //+ x;
            minoSprite.y = ((mino.y - fallingPiece.y) * -16) + 100//+ y;
            this.addChild(minoSprite);
        }
    }
}