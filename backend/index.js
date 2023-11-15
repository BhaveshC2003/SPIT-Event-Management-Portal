const http = require('http');
const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const dotenv = require("dotenv")
const connectDatabase  = require("./utils/connectDatabase")
const socketIO = require("socket.io")
const LamportClock = require('./lamportClock')
const Bully = require("./election/election")

const ID = "3"

dotenv.config()

global.clock = new LamportClock(5)
global.bully = new Bully(ID)

const app = express()

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors({credentials:true,origin:"http://localhost:3000"}))

const server = http.createServer(app);

const userRoutes = require("./routes/user/userRoutes");
app.use("/api", userRoutes)


const io = socketIO(server)

const users = [];

io.on('connection',(socket)=>{
        socket.on('joined',({username})=>{
        users[socket.id] = username;
        socket.emit('greet',{user:"Admin",message:`Welcome ${username}`});
        socket.broadcast.emit('userJoined',{user:"Admin",message: `${username} has joined the chat`});
    });

    socket.on('sendMessageToServer',({userMessage,id})=>{
        io.emit('sendMessageToUser',{user: users[id],id,userMessage});
    });

});

server.listen(process.env.PORT, async()=>{
    console.log("Server running on PORT: " + process.env.PORT)
    connectDatabase()
    console.log(`Inital clock value is ${global.clock.clock}`)
    await global.bully.ipc.connect()
    await global.bully.ipc.clearQueue(global.bully.pid)
    await global.bully.getPids()
    global.bully.elect()
})

module.exports = server