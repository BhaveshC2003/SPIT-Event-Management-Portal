const IPC = require("./ipc")

class Bully{
    constructor(pid = null) {
        console.log(`Process id is ${pid}`)
        this.pid = pid
        this.isLeader = false
        this.leader = null
        this.lastTimestamp = 0
        this.isElectionActive = false
        this.processes = []
        this.ipc = new IPC()
        this.interval = null
    }
    //Getting timestamp
    getTimestamp(){
        const timestamp = new Date(Date.now()).getTime()
        return timestamp
    }
    //Getting other processes ids
    async getPids(){
        const response = await fetch("http://localhost:8000")
        const {ids} = await response.json()
        this.processes = ids.filter(id=>id != this.pid)
        console.log(`Other processes ids are : ${this.processes}`)
    }
    async sendHearbeat(queue="common") {
        this.processes.forEach(async(id)=>{
            if(id < this.pid)
                await this.ipc.send({type:"heartbeat",pid:this.pid},id)
        })
    }
    async elect(){
        this.leader = null
        this.lastTimestamp = 0
        this.isElectionActive = true
        //If response is not received within certain interval then the process it self becomes the leader
        setTimeout(()=>{
            if(this.leader === null){
                console.log(`No response received from higher processes`)
                this.leader = this.pid
            }
            this.processes.forEach(async(id)=>{
                await this.ipc.send({type:"leader",pid:this.leader},id)
            })
            this.checkLeader()
        },15000)
        //Listening to events
        while(true){
            const response = await this.ipc.receive(this.pid)
            if(response && response?.type === "election"){
                //Sending ack to lower processes
                await this.ipc.send({type:"token",pid:this.pid},response.pid)
            }else if(response && response?.type == "token"){
                this.leader = Math.max(this.leader,response.pid)
            }else if(response && response?.type === "leader"){
                this.isElectionActive = false
                this.leader = response.pid
                this.lastTimestamp = this.getTimestamp()
                if(this.leader === this.pid)
                    console.log("You are now the leader")
                else
                    console.log(`Process ${this.leader} is leader`)
                break
            }
            this.processes.forEach(async(id)=>{
                if(id > this.pid){
                    const timestamp = this.getTimestamp()
                    await this.ipc.send({type:"election",pid:this.pid,timestamp},id)
                }
            })
        }
    }
    async checkLeader(){
         //Clearing queue to remove old messages
        await this.ipc.clearQueue(this.pid)
        if(this.leader === this.pid){
            this.interval = setInterval(async()=>{
                const response = await this.ipc.receive(this.pid)
                if(response && response.type === "election" && this.lastTimestamp < response.timestamp){
                    console.log("Node online")
                    console.log("Starting election...")
                    await this.ipc.clearQueue(this.pid)
                    this.elect()
                    clearInterval(this.interval)
                }else
                    this.sendHearbeat()
            },2000)
        }else{
            const id = setInterval(async()=>{
                const response = await this.ipc.receive(this.pid)
                if(!response){
                    console.log("Leader has gone offline")
                    console.log("Starting election...")
                    setTimeout(()=>this.elect(),6000)
                    clearInterval(id)
                }
                else if(response.type === "heartbeat"){
                    console.log("Leader is online")    
                }else if(response.type === "election"){
                    console.log("Node online")
                    console.log("Starting election...")
                    await this.ipc.clearQueue(this.pid)
                    clearInterval(id)
                    this.elect()
                }
            },10000)
        }
    }
}


module.exports = Bully