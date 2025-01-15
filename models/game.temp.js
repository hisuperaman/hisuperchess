const mongoose = require('mongoose');

const gameTempSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true
    },
    player1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    player2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    timer: {
        type: Number,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 5*60,
    },
})


const gameTempModel = mongoose.model('GameTemp', gameTempSchema)

module.exports = gameTempModel