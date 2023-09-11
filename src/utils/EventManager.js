class EventManager
{
    static #eventIdCounter = 0;

    constructor()
    {
        this._events = {}
    }

    addEvent(name, func)
    {
        const eventId = EventManager.#eventIdCounter++

        if (this._events[name] === undefined)
            this._events[name] = []
        this._events[name].push({func, eventId})

        return eventId;
    }

    callEvent(name, data)
    {
        if (this._events[name] === undefined)
            return;

        let events = this._events[name]
        for (let event of events)
        {
            event.func(data)
        }
    }

    /**
     * 
     * @param  {...Number} idsToRemove 
     */
    removeEvent(...idsToRemove)
    {
        for (let [trigger, events] of Object.entries(this._events))
            this._events[trigger] = events.filter((_event) => !idsToRemove.includes(_event.eventId));
    }
}

const eventManager = new EventManager();