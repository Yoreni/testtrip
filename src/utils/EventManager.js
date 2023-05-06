class EventManager
{
    constructor()
    {
        this._events = {}
    }

    addEvent(name, func)
    {
        if (this._events[name] === undefined)
            this._events[name] = []
        this._events[name].push(func)
    }

    callEvent(name, data)
    {
        if (this._events[name] === undefined)
            throw `${name} is not a defined event`

        let functions = this._events[name]
        for (let func of functions)
        {
            func(data)
        }
    }
}

const eventManager = new EventManager();