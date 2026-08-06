require("dotenv").config();
const app=require("./src/app");
const dns=require("dns");
const connectToDb=require("./src/db/db")
const initSocketServer=require("./src/sockets/socket.server")

const httpServer=require("http").createServer(app)

dns.setServers(["1.1.1.1","8.8.8.8"]);

connectToDb();
initSocketServer(httpServer)


httpServer.listen(3000,()=>{
    console.log("server is running on port 3000")
})