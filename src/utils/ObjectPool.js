class ObjectPool
{
    constructor(size)
    {
        this.pool = []

        for (let index = 0; index < size; ++index)
            this.pool.push(new PIXI.Sprite);
    }

    borrow()
    {
        return this.pool.pop();
    }

    return(sprite)
    {
        //TODO: maybe reset the spite somehow
        this.pool.push(sprite);
    }
}