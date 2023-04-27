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

// function multiplyMatrix(materix1, materix2)
// {
// 	for(a = 0 ; a < 4 ; a++)
// 	{
// 		//MATHS YAY
// 		var x = player.pos[a].x - player.centerX;
// 		var y = player.pos[a].y - player.centerY;
// 		var newX = (identity[0][0] * x) + (identity[0][1] * y);
// 		var newY = (identity[1][0] * x) + (identity[1][1] * y);
// 		player.pos[a].x = player.centerX + newX;
// 		player.pos[a].y = player.centerY + newY;
// 	}
// }

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