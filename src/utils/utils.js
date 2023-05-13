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

function mod(num1, num2)
{
    return ((num1 % num2) + num2) % num2;
}

function deepCopy(object)
{
    return JSON.parse(JSON.stringify(object))
}

function mss000timeformat(totalSeconds)
{
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60).toString();
    const milliseconds = Math.floor((totalSeconds % 1) * 1000).toString();

    if (minutes < 100)
        return `${minutes}:${seconds.padStart(2, '0')}.${milliseconds.padStart(3, '0')}`
    else
        return "99:59.999"
}

/**
 * Shuffles array in place.
 * @param {Array} array items An array containing the items.
 */
function shuffle(array) 
{
    for (let index = array.length - 1; index > 0; index--) 
    {
        let index2 = randInt(0, index);
        //swap the 2 indexes around
        [array[index], array[index2]] = [array[index2], array[index]]
    }

    return array;
}

function Point(x, y)
{
    return {
        x: x,
        y: y
    }
}

function saveOptionsWithDeafults(settingsObject, defaultsObject)
{
    let object = Object.create(defaultsObject);

    for (let key of Object.keys(settingsObject))
        object[key] = settingsObject[key]

    return object;
}