const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const { globalLimiter } = require('./middleware/rateLimit.middleware')

// Middleware
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())
app.use(globalLimiter) // Apply global rate limiting

// Routes
app.use('/api/auth', require('./routes/auth.route'))
app.use('/api/users', require('./routes/user.route'))
app.use('/api/transactions', require('./routes/transaction.route'))
app.use('/api/dashboard', require('./routes/dashboard.route'))

module.exports = app