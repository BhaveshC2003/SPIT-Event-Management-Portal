const { parentPort, workerData } = require("worker_threads")

//CPU intensive work
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
  }

const bookTicket = (data) => {
    const time = new Date(Date.now())
    console.log(`Booking ${data.event} ticket for ${data.username} at ${time}`)
    fibonacci(45)
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const success = 1 //Math.random() < 0.8
            if (success)
                resolve(`Booked ticket successfully for ${data.username} at ${new Date(Date.now())}`)
            else
                reject(`Failed to book tickets for ${data.username} at ${new Date(Date.now())}`)
        }, 100)
    })
}


bookTicket(workerData)
.then((message)=>parentPort.postMessage(message))
.catch(err=>console.log(err))

module.exports = bookTicket