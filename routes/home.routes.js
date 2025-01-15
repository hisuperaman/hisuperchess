const express = require('express')
const router = express.Router()
const {home, hostGame, cancelHostGame} = require('../controllers/home.controller')
const jwtVerify = require('../middlewares/jwtVerify')

router.get('/', jwtVerify, home)

module.exports = router