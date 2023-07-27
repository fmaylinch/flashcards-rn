class Events {

    constructor() {
        this.events = {};
    }

    register(id, event, callback) {
        if (!this.events[event]) {
            this.events[event] = {};
        }
        console.log(`Registered ${id} for event ${event}`)
        this.events[event][id] = callback;
    }

    emit(event, value) {
        console.log(`Event ${event} was emitted`);
        const listeners = this.events[event];
        if (listeners) {
            for (const id of Object.keys(listeners)) {
                console.log(`Calling ${id} for event ${event}`);
                listeners[id](value);
            }
        }
    }

    unregisterAll(id) {
        for (const event of Object.keys(this.events)) {
            const listeners = this.events[event];
            if (listeners[id]) {
                console.log(`Unregistering ${id} from event ${event}`);
                delete listeners[id];
            }
        }
    }
}

export default new Events();