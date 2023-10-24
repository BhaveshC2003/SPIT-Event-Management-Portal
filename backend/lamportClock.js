const asyncMutex  = require('async-mutex')

const mutex = new asyncMutex.Mutex()

class LamportClock {
    constructor(rate) {
      this.clock = 0;
      this.rate = rate
    }
  
    async increment() {
        await mutex.acquire()
        this.clock += this.rate
        console.log(`Current server clock value : ${this.clock}`)
        await mutex.release()
    }
  
    getTimestamp() {
        return this.clock;
    }
  
    async receiveMessage(messageTimestamp) {
        await mutex.acquire()
        this.clock = Math.max(this.clock, messageTimestamp) + this.rate;
        console.log(`Current server clock value : ${this.clock}`)
        await mutex.release()
    }
  }

  module.exports = LamportClock