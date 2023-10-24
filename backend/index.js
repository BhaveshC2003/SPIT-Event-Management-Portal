const http = require('http');
const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const dotenv = require("dotenv")
const connectDatabase  = require("./utils/connectDatabase")
const socketIO = require("socket.io")
const LamportClock = require('./lamportClock');

dotenv.config()

global.clock = new LamportClock(5)

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
        //console.log(`${username} joined`)
        users[socket.id] = username;
        socket.emit('greet',{user:"Admin",message:`Welcome ${username}`});
        socket.broadcast.emit('userJoined',{user:"Admin",message: `${username} has joined the chat`});
    });

    socket.on('sendMessageToServer',({userMessage,id})=>{
        io.emit('sendMessageToUser',{user: users[id],id,userMessage});
    });

});

server.listen(process.env.PORT, ()=>{
    console.log("Server running on PORT: " + process.env.PORT)
    connectDatabase()
    console.log(`Inital clock value is ${global.clock.clock}`)
})

module.exports = server