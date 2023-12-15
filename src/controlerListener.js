let controllerIndex = [];

const InputDevices =  Object.freeze({
    KEYBOARD: 0,
    GAMEPAD_0: 1,
    GAMEPAD_1: 2,
    GAMEPAD_2: 3,
    GAMEPAD_3: 4,
})

let playerInputs = [InputDevices.GAMEPAD_0, null]

window.addEventListener("gamepadconnected", (e) => 
{
    controllerIndex.push(e.gamepad.index)
    console.log(
        "Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index,
        e.gamepad.id,
        e.gamepad.buttons.length,
        e.gamepad.axes.length,
    );
});

window.addEventListener("gamepaddisconnected", (e) => 
{
    controllerIndex = controllerIndex.filter(element => element != e.gamepad.index)
    console.log(`Gamepad index ${e.gamepad.index} disconnected`);
})