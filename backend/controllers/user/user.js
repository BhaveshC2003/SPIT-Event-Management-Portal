const User = require("../../models/user")
//const bookTicket = require("../../thread")
const generateJWT = require("../../utils/generateJWT")
const {Worker} = require("worker_threads")

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
exports.bookTickets = async(req,res,next)=>{
    const {username} = req.body.user
    const event = req.body.event
    console.log(`Server clock value before request : ${global.clock.getTimestamp()}`)
    console.log(`Client(${username}) clock value : ${req.body.clock}`)
    global.clock.receiveMessage(req.body.clock)
    const worker = new Worker("./thread.js",{workerData:{username,event}})
    worker.on("message",function(data){
        console.log(data)
        res.status(200).json({
            success:true,
            message:"Successfully booked tickets",
            clock:global.clock.getTimestamp()
        })
    })
}



//Non-thread program  --response time = 23000ms
// exports.bookTickets = async(req,res,next)=>{
//     const {username,event} = req.body
//     bookTicket({username,event})
//     .then((data)=>{
//         console.log(data)
//         res.status(200).json({success:true})
//     })
//     .catch((err)=>{
//         console.log(err)
//         res.status(500).json({success:false})
//     })
// }

