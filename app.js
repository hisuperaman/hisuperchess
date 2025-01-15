const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const dbConnect = require('./config/db.config')
const cookieParser = require('cookie-parser')

const cors = require('cors')

const authRouter = require('./routes/auth.routes')
const homeRouter = require('./routes/home.routes')

const app = express()

dbConnect()

app.use(express.static(path.join(__dirname, 'public')))

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())

app.use(cookieParser())

app.use('/auth', authRouter)

app.use('/', homeRouter)

module.exports = app