const mongoose = require("mongoose")

const connectDatabase = ()=>{
    mongoose.connect("mongodb://127.0.0.1:27017/SPIT")
    .then(()=>{
        console.log("Connected to mongoDB")
    })
    .catch((err)=>{
        console.log("Failed to connect to mongoDB")
    })
}

module.exports =  connectDatabase