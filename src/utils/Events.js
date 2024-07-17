const events = new Map()

export default{
    $on(eventName,fn){
        if (!events.has(eventName))
            events.set(eventName,[])

        events.get(eventName).push(fn)
    },

    $off(eventName, fn) {
        if (events.has(eventName)) {
          const listeners = events.get(eventName);
          const index = listeners.indexOf(fn);
          if (index !== -1) {
            listeners.splice(index, 1);
          }
        }
    },
    
    $emit(eventName, data){
        if (events.has(eventName))
            events.get(eventName).forEach(fn => fn(data))
    }

}