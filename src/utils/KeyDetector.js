function KeyDetector(app, key)
{
    this.tick = function(delta) 
    {
        if(this.isDown)
            this.framesDown += 1
    } 

    this.isDown = false
    this.framesDown = 0
    this.firstPressed = 0

    document.addEventListener('keydown', (e) =>
    {
        e.preventDefault();
        if(e.key === key)
        {
            if(!this.isDown)
            {
                this.firstPressed = new Date().getTime()
                this.onDown()
            }

           this.isDown = true
        }
    }, false)

    document.addEventListener('keyup', (e) =>
    {
        e.preventDefault();
        if(e.key === key)
        {
            this.isDown = false
            this.framesDown = 0
            this.secondsDown = 0
            this.onUp()
        }
    }, false)
    app.ticker.add(this.tick.bind(this))
}

KeyDetector.prototype.getSecondsDown = function()
{
    return this.isDown ? ((new Date().getTime()) - this.firstPressed) / 1000 : 0
} 

/**
 * when making an object this is the function you want to change
 * 
 * this fires while the key is pressed down 
 */
KeyDetector.prototype.onDown = function()
{

}

/**
 * you can change this one too
 * 
 * this fires when its has been released
 */
KeyDetector.prototype.onUp = function()
{

}