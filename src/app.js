const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')

// Middleware
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth', require('./routes/auth.route'))
app.use('/api/transactions', require('./routes/transaction.route'))
app.use('/api/dashboard', require('./routes/dashboard.route'))

module.exports = app