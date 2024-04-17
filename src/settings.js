const handling = JSON.parse(localStorage.getItem("handling")) ?? {
    //default handling
    DAS: 125,
    SDF: 1.79e308,
    ARR: 16,
}

const controls = JSON.parse(localStorage.getItem("controls")) ?? {  
    //default controls
    moveLeft: "ArrowLeft",
    moveRight: "ArrowRight",
    softdrop: "ArrowDown",
    rotateClockwise: "ArrowUp",
    rotateAnticlockwise: "z",
    hold: "x",
    rotate180: "c",
    harddrop: " ",
    reset: "r",
}
KeyBinder.controlsObject = controls;

function saveSettingsToLocalStorange()
{
    localStorage.setItem("handling",  JSON.stringify(handling));
    localStorage.setItem("controls",  JSON.stringify(controls));
}
