const gameTempModel = require("../models/game.temp");


function home(req, res) {
    return res.render('home', {
        user: req.user
    })
}

module.exports = {
    home,
}