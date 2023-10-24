const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    username:{
        type:String
    },
    email:{
        type:String,
        unique:[true,"Account already exist"]
    },
    password:{
        type:String,
        minLenght: 5
    },
    role:{
        type:String,
        default:"user"
    }
})

const User = mongoose.model("User", UserSchema)

module.exports = User