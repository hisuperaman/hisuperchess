const userModel = require("../models/user.model")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

async function handleLogin(req, res){
    const {email, password} = req.body

    try {
        const user = await userModel.findOne({email})
        if(!user){
            return res.status(401).send('Username or password is incorrect')
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(401).send('Username or password is incorrect')
        }

        const token = jwt.sign({id: user._id, name: user.name, email: user.email}, process.env.JWT_SECRET)
        res.cookie('token', token, {httpOnly: true})
        return res.redirect('/')
    }
    catch(err){
        console.log(err)
        return res.status(500).send('Internal server error')
    }
}

async function handleSignup(req, res){
    const {name, email, password} = req.body
    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        console.log(hashedPassword)
        const user = new userModel({
            name,
            email,
            password: hashedPassword  
        })
        await user.save()
        return res.redirect('/auth/login')
    }
    catch(err){
        console.log(err)
        return res.status(400).send('Error creating user')
    }
}

function handleLogout(req, res) {
    res.clearCookie('token')
    return res.redirect('/auth/login')
}

module.exports = {
    handleLogin,
    handleSignup,
    handleLogout
}