const asyncMutex  = require('async-mutex')

const mutex = new asyncMutex.Mutex()

class LamportClock {
    constructor(rate=1) {
      this.clock = 0;
      this.rate = rate
    }
  
    async increment() {
        this.clock += this.rate
        console.log(`Current clock value : ${this.clock}`)
    }
  
    getTimestamp() {
        return this.clock;
    }
  
    async receiveMessage(messageTimestamp) {
        this.clock = Math.max(this.clock, messageTimestamp) + this.rate;
        console.log(`Current clock value : ${this.clock}`)
    }
  }

  module.exports = LamportClock