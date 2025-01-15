const gameResultModel = require("../models/game.result.model");
const gameTempModel = require("../models/game.temp");
const userModel = require("../models/user.model");

function gameSocket(io, socket) {
    socket.on('hostGameRoom', async (data, ack) => {
        const { timer } = data

        const gameTemp = new gameTempModel({
            player1: socket.id,
            timer: timer
        })

        try {
            const roomId = Math.floor(100000 + Math.random() * 900000).toString();
            gameTemp.roomId = roomId;
            await gameTemp.save();

            // use string for roomId
            socket.join(roomId)

            return ack({ status: 'ok', 'message': 'done', waitTime: 5 * 60, roomId })

        }
        catch (e) {
            console.log(e)
            return ack({ status: 'error', 'message': 'Internal Server Error' })
        }
    })

    socket.on('cancelGameRoom', async (data, ack) => {
        const { roomId } = data

        try {
            const gameTemp = await gameTempModel.findOne({ roomId })

            if (!gameTemp) {
                return res.status(404).json({ 'message': 'Game not found' })
            }
            await gameTemp.deleteOne()

            socket.leave(roomId)

            return ack({ status: 'ok', 'message': 'done' })
        }
        catch (e) {
            console.log(e)
            return ack({ status: 'error', 'message': 'Internal Server Error' })
        }
    })

    socket.on('joinGameRoom', async (data, ack) => {
        const { roomId } = data

        const gameTemp = await gameTempModel.findOne({roomId})
        if(!gameTemp) {
            return ack({ status: 'error', 'message': 'Game not found' })
        }

        if(gameTemp.player2) {
            return ack({ status: 'error', 'message': 'Game already started' })
        }

        gameTemp.player2 = socket.id
        await gameTemp.save()

        socket.join(roomId)
        
        io.to(gameTemp.player1.toString()).emit('playerJoined', { status: 'ok', message: 'done' })


        return ack({ status: 'ok', 'message': 'done' })
    })

    socket.on('startGame', async (data, ack) => {
        const { roomId, timer } = data

        const player1Color = Math.random() > 0.5 ? 'w' : 'b'

        const gameTemp = await gameTempModel.findOne({ roomId })
        const gameResult = new gameResultModel({
            roomId: roomId,
            player1: { id: gameTemp.player1, color: player1Color },
            player2: { id: gameTemp.player2, color: player1Color=='w'? 'b': 'w' },
            timer: timer,
        })
        await gameResult.save()
        await gameTemp.deleteOne()

        const player1 = await userModel.findOne(gameResult.player1.id)
        const player2 = await userModel.findOne(gameResult.player2.id)  

        const whitePlayer = gameResult.player1.color == 'w' ? {id: player1.id, name: player1.name} : {id: player2.id, name: player2.name}
        const blackPlayer = gameResult.player1.color == 'b' ? {id: player1.id, name: player1.name} : {id: player2.id, name: player2.name}

        io.to(roomId).emit('startGame', { status: 'ok', message: 'done', whitePlayer, blackPlayer, gameId: gameResult._id, maxTimer: timer })
    })

    socket.on('resignGame', async (data, ack) => {
        const { roomId, gameId, resignedPlayer } = data

        const gameResult = await gameResultModel.findById(gameId)
        if(!gameResult) {
            return ack({ status: 'error', 'message': 'game not found' })
        }

        gameResult.winner = resignedPlayer.id == gameResult.player1.id ? gameResult.player2.id : gameResult.player1.id
        gameResult.reason = 'resign'
        await gameResult.save()

        io.to(roomId).emit('resignGame', {status: 'ok', message: 'done', resignedPlayer})
        
        return ack({ status: 'ok', 'message': 'done' })
    })
    
    socket.on('timeOut', async (data, ack) => {
        const { roomId, gameId, winner } = data

        const gameResult = await gameResultModel.findById(gameId)
        if(!gameResult) {
            return ack({ status: 'error', 'message': 'game not found' })
        }

        gameResult.winner = winner.id
        gameResult.reason = 'timeout'
        await gameResult.save()

        io.to(roomId).emit('timeOut', {status: 'ok', message: 'done', winner})
        return ack({ status: 'ok', 'message': 'done' })
    })

    socket.on('checkmate', async (data, ack) => {
        const { roomId, gameId, winner } = data

        const gameResult = await gameResultModel.findById(gameId)
        if(!gameResult) {
            return ack({ status: 'error', 'message': 'game not found' })
        }

        gameResult.winner = winner.id
        gameResult.reason = 'checkmate'
        await gameResult.save()

        io.to(roomId).emit('checkmate', {status: 'ok', message: 'done', winner})
        return ack({ status: 'ok', 'message': 'done' })
    })

    socket.on('leaveRoom', async (data, ack) => {
        const { roomId } = data

        socket.leave(roomId)
        return ack({ status: 'ok', 'message': 'done' })
    })


    // running game events
    socket.on('movePiece', async (data) => {    
        const { roomId, move } = data
        // console.log(roomId)

        io.to(roomId).emit('movePiece', { move })
    })
}

module.exports = gameSocket