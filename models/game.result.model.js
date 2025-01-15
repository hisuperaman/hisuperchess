const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    color: {
        type: String,
        required: true
    }
})

const gameResultSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
    },
    player1: {
        type: playerSchema,
        required: true
    },
    player2: {
        type: playerSchema,
        required: true
    },
    timer: {
        type: Number,
        required: true
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    reason: {
        type: String,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
})


const gameResultModel = mongoose.model('GameResult', gameResultSchema)

module.exports = gameResultModel