const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const userRouter = require('./router/userRouter')
const imagerouter = require('./router/imageRouter')

const app = express()

app.use(cors('*'))

app.use(morgan('dev'))

app.use(express.json({
    limit:"50mb"
}))



app.use('/api/user', userRouter)
app.use('/api/image', imagerouter)

module.exports = app