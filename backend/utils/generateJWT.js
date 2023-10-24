const jwt = require("jsonwebtoken")

const generateJWT = (user_id)=>{
    return jwt.sign({user:user_id},process.env.JWT_SECRET)
}

module.exports = generateJWT