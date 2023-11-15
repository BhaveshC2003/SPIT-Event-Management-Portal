const sendEmail = require("../utils/sendEmail")
const Bully = require("../election/election")
const fs = require("fs")

const ID = "2"

let bully

(async function (){
    bully = new Bully(ID)
    await bully.ipc.connect()
    await bully.ipc.clearQueue(bully.pid)
    await bully.getPids()
    bully.elect()
    setInterval(async()=>{
        const data = await bully.ipc.receive("send_mail")
        if(data){
            fs.readFile("../utils/mail_template/index.html","utf8",(err,htmlString)=>{
                const {user} = data
                const html = htmlString.replace("{user}",user.username)
                const options = {
                    email:user.email,
                    subject:`HURRAY!! Your tickets have been booked!!`,
                    html
                }
                sendEmail(options)
            })
        }
    },3000)
})()

