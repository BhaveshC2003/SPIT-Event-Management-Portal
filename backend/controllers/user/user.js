const User = require("../../models/user")
//const bookTicket = require("../../thread")
const generateJWT = require("../../utils/generateJWT")
const {Worker} = require("worker_threads")
const sendEmail = require("../../utils/sendEmail")

exports.register = async(req,res,next)=>{
    try{
        const user = await User.create(req.body)
        res.status(200).json({
            success:true,
            user
        })
    }catch(err){
        res.status(500).json({
            success:false
        })
    }
}

exports.login = async(req,res,next)=>{
    try{
        const {email,password} = req.body
        const user = await User.findOne({email:email})
        if(!user)
        return res.status(401).json({
            success:false,
            message:"User does not exist"
        })
        if(user.password !== password)
            return res.status(401).json({
                success:false,
                message:"Invalid password"
            })
        const token = generateJWT(user._id)
        res.cookie("access_token",token).status(200).json({
            success:true,
            token
        })
    }catch(err){
        res.status(500).json({
            success:false
        })
    }
}

exports.logout = (req,res,next)=>{
    try{
        res.clearCookie("access_token").status(200).json({
            success:true
        })
    }catch(err){
        res.status(500).json({
            success:false
        })
    }
}

exports.loadUser = async(req,res,next)=>{
    const user = await User.findById(req.body.user_id).select("-password")
    res.status(200).json({
        success:true,
        user
    })
}

//Ticket booking using threads --response time = 13000ms
// exports.bookTickets = async(req,res,next)=>{
//     const {username,email} = req.body.user
//     const event = req.body.event
//     console.log(`Server clock value before request : ${global.clock.getTimestamp()}`)
//     console.log(`Client(${username}) clock value : ${req.body.clock}`)
//     global.clock.receiveMessage(req.body.clock)
//     const worker = new Worker("./thread.js",{workerData:{username,event}})
//     worker.on("message",function(data){
//         console.log(data)
//         sendEmail({email,subject:"Hurray!! Tickets Booked",message:"Your ticket has been successfully booked."})
//         res.status(200).json({
//             success:true,
//             message:"Successfully booked tickets",
//             clock:global.clock.getTimestamp()
//         })
//     })
// }

exports.bookTickets = async (req,res)=>{
    await global.bully.ipc.send({data:{user:req.body.user,event:req.body.event}},"book_tickets")
    const interval = setInterval(async()=>{
        const response = await global.bully.ipc.receive("book_tickets_success")
        if(response){
            await global.bully.ipc.send({user:{email:req.body.user.email,username:req.body.user.username}},"send_mail")
            clearInterval(interval)
            res.status(200).json({
                success:true,
                message:"Booked tickets successfully"
            })
        }
    },3000)
}

