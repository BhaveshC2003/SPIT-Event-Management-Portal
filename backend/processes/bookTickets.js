const Bully = require("../election/election")
const {Worker} = require("worker_threads")

const ID = "1"

bookTickets = async(data)=>{
    const {username,email} = data.user
    const event = data.event
    const worker = new Worker("../thread.js",{workerData:{username,event}})
    worker.on("message",async function(data){
        console.log(data)
        await bully.ipc.send({success:true},"book_tickets_success")
    })
}

let bully

(async function (){
    bully = new Bully(ID)
    await bully.ipc.connect()
    await bully.ipc.clearQueue(bully.pid)
    await bully.getPids()
    bully.elect()
    setInterval(async()=>{
        const response = await bully.ipc.receive("book_tickets")
        if(response)
            bookTickets(response.data)
    },3000)
})()




