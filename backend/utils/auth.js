const jwt = require("jsonwebtoken")

const auth = (req,res,next)=>{
    const token = req.cookies["access_token"]
    if(!token)
        res.status(400).json({message:"You are not logged in"})
    const decoded_data = jwt.verify(token,process.env.JWT_SECRET)
    req.body.user_id = decoded_data["user"]
    next()
}

module.exports = auth