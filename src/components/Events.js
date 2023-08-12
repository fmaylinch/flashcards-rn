import {useState, useEffect} from 'react';

class Events {

    constructor() {
        this.events = {};
    }

    register(id, event, callback) {
        if (!this.events[event]) {
            this.events[event] = {};
        }
        console.log(`${id} registered for event ${event}`)
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

    unregister(id, event) {
        const listeners = this.events[event];
        if (listeners[id]) {
            console.log(`${id} unregisters from event ${event}`);
            delete listeners[id];
        }
    }

    unregisterAll(id) {
        console.log(`${id} unregisters from all events`);
        for (const event of Object.keys(this.events)) {
            this.unregister(id, event);
        }
    }
}

export const events = new Events();

export const emitEvent = (event, value) => events.emit(event, value);

export const registerEvent = (id, event, callback) => {

  // These 2 effects handle the event.
  // The first effect stores the event object with setEventObject,
  // and that change triggers the second effect.

  // Previously, I called the callback directly from the callback of events.register,
  // but I saw that this way the component sometimes has an invalid (empty) state.
  // For example, in ListScreen the list of cards was empty.

  const [eventObject, setEventObject] = useState();

  useEffect(() => {
    events.register(id, event, evObj => {
      console.log(`${id} stores event ${event}`);
      // callback(evObj); <-- this didn´t work well
      // next state change will trigger the effect below
      setEventObject(evObj);
    });
    // unregister when the component in unmounted
    return () => events.unregister(id, event);
  }, []);

  useEffect(() => {
    if (eventObject) {
      console.log(`${id} calls callback for event ${event}`);
      callback(eventObject);
      setEventObject(null); // processed
    }
  }, [eventObject]);

};