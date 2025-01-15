const dotenv = require('dotenv')
dotenv.config()

const http = require('http')
const app = require('./app')

const { Server: SocketIo } = require('socket.io')
const socketHandler = require('./sockets/socket')

const server = http.createServer(app)

const io = new SocketIo(server, {
    
})

socketHandler(io)

server.listen(process.env.PORT, ()=>{
    console.log("Server started at PORT", process.env.PORT)
})