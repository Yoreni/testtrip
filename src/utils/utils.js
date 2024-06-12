/**
 * returns random integer number between min and max, both parameters are
 * inclusive.
 * 
 * @param {number} min 
 * @param {number} max 
 */
function randInt(min, max) 
{
    //global
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

/**
 * Displays a number in seconds into human readble m:ss.000 format
 * 
 * @param {number} totalSeconds 
 * @returns {string}
 */
function mss000timeformat(totalSeconds)
{
    let sign = ""
    if (totalSeconds < 0)
    {
        totalSeconds = Math.abs(totalSeconds);
        sign = "-"
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60).toString();
    const milliseconds = Math.floor((totalSeconds % 1) * 1000).toString();

    if (minutes < 100)
        return `${sign}${minutes}:${seconds.padStart(2, '0')}.${milliseconds.padStart(3, '0')}`
    else
        return `${sign}99:59.999`
}

/**
 * Shuffles array in place.
 * @param {Array} array items An array containing the items.
 */
function shuffle(array, random = null) 
{
    const randIntFunction = random instanceof Random ? random.randInt.bind(random) : randInt;
    
    for (let index = array.length - 1; index > 0; index--) 
    {
        let index2 = randIntFunction(0, index);
        //swap the 2 indexes around
        [array[index], array[index2]] = [array[index2], array[index]]
    }

    return array;
}

/**
 * puts your specified x and y cords into an object with
 * x and y attributes
 * 
 * @param {Number} x 
 * @param {Number} y 
 * @returns {Object{Number, Number}
 */
function Point(x, y)
{
    return {
        x, y
    }
}

/**
 * set default values of an object if a value for an attribute is not given
 * 
 * @param {object} settingsObject 
 * @param {object} defaultsObject 
 * @returns {object}
 */
function saveOptionsWithDeafults(settingsObject, defaultsObject)
{
    if (settingsObject === undefined || settingsObject === null)
        settingsObject = {}
    let object = Object.create(defaultsObject);

    for (let key of Object.keys(settingsObject))
        object[key] = settingsObject[key]

    return object;
}

function getFileExtension(filename)
{
  var parts = filename.split('.');
  var extension = parts[parts.length - 1];
  return extension;
}

function getOrDefault(expression, diyfowt)
{
    return expression === undefined ? diyfowt : expression;
}

function _enum(...names)
{
    let object = {};
    for (const name of names) 
        object[name] = Symbol(name);
    return Object.freeze(object);
}

/**
 * 
 * sets a number to be in the bounds of min and max
 * 
 * @param {Number} number 
 * @param {Number} min 
 * @param {Number} max 
 * @returns {Number}
 */
function clamp(number, min, max)
{
    return Math.max(min, Math.min(max, number))
}

function textStyle(size = 24)
{
    return {
        fontSize: size,
        fontFamily: "Calibri", 
        "align": "center",
    }
}

function countOccrences(array, elementToFind)
{
    let count = 0;
    for (const element of array)
    {
        if (element === elementToFind)
            ++count;
    }

    return count;
}

function sum(array)
{
    return array.reduce((partialSum, number) => partialSum + number, 0);
}

function interpolateColour(startColour, endColour, progress) 
{
    progress = clamp(progress, 0, 1);

    if (progress === 0) 
        return startColour;
    if (progress === 1) 
        return endColour;

    const interpolateComponent = (start, end, p) => start + (end - start) * p;

    // Extract RGB components from the colors
    const startRed = (startColour >> 16) & 0xff;
    const startGreen = (startColour >> 8) & 0xff;
    const startBlue = startColour & 0xff;

    const endRed = (endColour >> 16) & 0xff;
    const endGreen = (endColour >> 8) & 0xff;
    const endBlue = endColour & 0xff;

    // Interpolate each RGB component
    const interpolatedRed = Math.round(interpolateComponent(startRed, endRed, progress));
    const interpolatedGreen = Math.round(interpolateComponent(startGreen, endGreen, progress));
    const interpolatedBlue = Math.round(interpolateComponent(startBlue, endBlue, progress));

    // Combine interpolated components into a single color
    const interpolatedColor = (interpolatedRed << 16) | (interpolatedGreen << 8) | interpolatedBlue;

    return interpolatedColor;
}

/**
 * 
 * Loads and runs javascript code from a file
 * https://stackoverflow.com/questions/21294/dynamically-load-a-javascript-file
 * 
 * @param {String} filePath 
 * @returns {Promise}
 */
function loadJavascript(filePath)
{
    return new Promise((resolve, reject) => 
    {
        // adding the script element to the head as suggested before
        let head = document.getElementsByTagName('head')[0];
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = filePath;

        // then bind the event to the resolve function
        // there are several events for cross browser compatibility
        script.onreadystatechange = () => {
            if (script.readyState === 'complete' || script.readyState === 'loaded') 
                resolve();
        };
        script.onload = resolve;

        // handle errors
        script.onerror = reject;

        // fire the loading
        head.appendChild(script);
    });
}
