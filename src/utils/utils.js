/**
 * returns random integer number between min and max, both parameters are
 * inclusive.
 * 
 * @param {number} min 
 * @param {number} max 
 */
function randInt(min, max) 
{
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * loads provided font familes from google web fonts.
 * @param {Array} families 
 * @param {Function} loadCallback 
 */
function loadWebfonts(families = ['Snippet'], loadCallback = undefined) 
{
    window.WebFontConfig = {
        google: {
            families: families,
        },

        active() {
            if (loadCallback) loadCallback();
        }
    };

    const webFontScript = document.createElement('script');
    webFontScript.src = `${document.location.protocol === 'https:' ? 'https' : 'http'}://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js`;
    webFontScript.type = 'text/javascript';
    webFontScript.async = 'true';
    const s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(webFontScript, s);
}

function addDragAndDrop(sprite)
{
    const onDragStart = (event, sprite) =>
    {
        if(sprite.dragAndDropEnabled) 
        {
            sprite.localX = event.data.global.x - sprite.x
            sprite.localY = event.data.global.y - sprite.y

            sprite.dragging = true;
        }
    }

    const onMouseMove = (event, sprite) =>
    {
        if (sprite.dragging) 
        {
            let x = event.data.global.x - sprite.localX
            let y = sprite.y = event.data.global.y - sprite.localY
            sprite.position.set(x, y)
        }
    }

    const onDragEnd = (event, sprite) =>
    {
        if(sprite.dragging)
        {
            sprite.dragging = false;
        }
    }
    
    sprite.interactive = true
    sprite.dragAndDropEnabled = true
    sprite.on('mousedown', (e) => onDragStart(e, sprite));
    sprite.on('mousemove',  (e) => onMouseMove(e, sprite));
    sprite.on('mouseup', (e) => onDragEnd(e, sprite));
    sprite.on('mouseupoutside', (e) => onDragEnd(e, sprite));
}