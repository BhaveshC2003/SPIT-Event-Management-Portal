const http = require("http")

const host = 'localhost';
const port = 8000;

const server = http.createServer((req,res)=>{
    res.setHeader("Content-Type", "application/json");
    res.writeHead(200)
    const data = {
        ids : ["1","2","3","4"]
    }
    res.end(JSON.stringify(data))
})

server.listen(port,host,()=>{
    console.log("Server listening")
})