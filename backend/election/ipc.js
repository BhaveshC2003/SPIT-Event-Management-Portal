const amqp = require("amqplib")

class IPC{
    constructor(queue=null,url=null){
        this.queue = "common"
        this.url = url || "amqp://localhost:5672"
        this.connection = null
    }

    async connect(){
        try{
            this.connection = await amqp.connect(this.url)
        }catch(err){
            console.log(err)
        }
    }
    async close(){
        await this.connection.close()
    }
    async send(message,queue="common"){
        try{
            if(this.connection === null)
                throw Error("Connection not established")
            const channel = await this.connection.createChannel()
            await channel.assertQueue(queue, {durable:false})
            //console.log("Sent ",message, ' to ', queue)
            channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)))
            await channel.close()
        }catch(err){
            console.error(err)
        }
    }
    async receive(queue="common"){
        try{
            let response = null
            const channel = await this.connection.createChannel()
            await channel.assertQueue(queue, {durable:false})
            await channel.consume(queue, (message)=>{
            if(message){
                response = JSON.parse(message.content.toString())
                }
            },{noAck:true})
            await channel.close()
            return response
        }catch(err){
            console.error(err)
        }   
    }
    async clearQueue(queue="common"){
        try{
            if(this.connection === null)
                throw Error("Connection not established")
            const channel = await this.connection.createChannel()
            const doesQueueExist = await channel.checkQueue(queue)
            if(!doesQueueExist){
                await channel.assertQueue(queue,{durable:false})
            }else{
                const messagesPurged = await channel.purgeQueue(queue)
            }
            await channel.close()
        }catch(err){
            console.log(err)
        }
    }
}

module.exports = IPC