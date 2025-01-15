const express = require('express')
const { handleLogin, handleSignup, handleLogout } = require('../controllers/auth.controller')
const loginChecker = require('../middlewares/login.checker')
const jwtVerify = require('../middlewares/jwtVerify')

const router = express.Router()

router.get('/login', loginChecker, (req, res)=>{
    return res.render('login')
})


router.post('/login', loginChecker, handleLogin)

router.get('/signup', loginChecker, (req, res)=>{
    return res.render('sign-up')
})
router.post('/signup', loginChecker, handleSignup)


router.get('/logout', jwtVerify, handleLogout)

module.exports = router