const amqp = require("amqplib")

//default url = "amqp://localhost"

class IPC{
    constructor(queue,url){
        this.queue = queue
        this.url = url
        this.connection = null
        this.channel = null
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
    async send(message){
        try{
            if(this.connection === null)
                throw Error("Connection not established")
            const channel = await this.connection.createChannel()
            await channel.assertQueue(this.queue, {durable:false})
            channel.sendToQueue(this.queue, Buffer.from(JSON.stringify(message)))
            console.log("Message sent")
            await channel.close()

        }catch(err){
            console.error(err)
        }
    }
    async receive(){
        try{
            const channel = await this.connection.createChannel()
            //Closing connection and channel when the process terminates
            process.once("SIGINT", async () => {
                await channel.close();
                await this.connection.close();
            });
            await channel.assertQueue(this.queue, {durable:false})
            await channel.consume(this.queue, (message)=>{
            if(message){
                console.log("Message received")
                console.log(JSON.parse(message.content.toString()))
                }
            },{noAck:true})
            await channel.close()
        }catch(err){
            console.error(err)
        }   
    }
}