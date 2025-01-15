const jwt = require('jsonwebtoken')

async function jwtVerify(req, res, next) {
    const token = req.cookies.token
    if (!token) {
        return res.status(401).redirect('/auth/login')
        // return res.status(401).send('Unauthorized')
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    }
    catch (err) {
        console.log(err)
        return res.status(401).redirect('/auth/login')
    }
}

module.exports = jwtVerify