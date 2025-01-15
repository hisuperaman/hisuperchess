const sioVerifyToken = require("../middlewares/sioJwtVerify")
const gameSocket = require("./gameSocket")

function socketHandler(io) {
    io.use(sioVerifyToken).on('connection', (socket)=>{
        gameSocket(io, socket)
    })
}

module.exports = socketHandler