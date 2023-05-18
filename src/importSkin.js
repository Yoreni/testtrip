document.addEventListener('drop', (e) =>
{
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    const extension = getFileExtension(file.name);
    if (file.size >= 10_000_000)
    {
        console.log("Files under 10 megabytes only")
        return;
    }
    if (extension !== "zip")
    {
        console.log("Zip files only");
        return;
    }

    readZip(file);
});

document.addEventListener('dragover', (event) => 
{
    event.preventDefault();
});

async function getFile(zipReader, filename)
{
    const entries = await zipReader.getEntries();
    for (let entry of entries)
    {
        if (entry.filename === filename)
            return entry;
    }

    throw `The file ${filename} could not be found`;
}

async function getFileData(file)
{
    const fileData = new TransformStream();
    const fileTextPromise = new Response(fileData.readable).text();

    await file.getData(fileData.writable);
    return fileTextPromise;
}

async function getJson(zipReader, filename)
{
    if (getFileExtension(filename) !== "json")
        throw `The file ${filename} is not a json file.`

    const file = await getFile(zipReader, filename);
    const data = await getFileData(file);

    return JSON.parse(data);
}

async function getPng(zipReader, filename)
{
    if (getFileExtension(filename) !== "png")
        throw `The file ${filename} is not a png file.`

    const file = await getFile(zipReader, filename);
    const pngData = await file.getData(new BlobWriter("image/png"))
    const url =  URL.createObjectURL(pngData); 
    return url;
    
}

async function readZip(zip)
{
    const zipFileReader = new BlobReader(zip);
    const zipReader = new ZipReader(zipFileReader);

    const packJson = await getJson(zipReader, "pack.json");

    const pngFile = await getPng(zipReader, "I.png");
    let pixiPNG = await PIXI.Texture.fromURL(pngFile);
    console.log(pixiPNG);
    console.log(pixiPNG.width);
}
