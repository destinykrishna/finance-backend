const mongoose = require('mongoose')

const connectTestDB = async () => {
    try {
        await mongoose.connect(process.env.TEST_MONGO_URI)
        console.log('Test MongoDB connected successfully')
    } catch (err) {
        console.error('Test MongoDB connection failed:', err.message)
        process.exit(1)
    }
}

const disconnectTestDB = async () => {
    try {
        await mongoose.disconnect()
        console.log('Test MongoDB disconnected successfully')
    } catch (err) {
        console.error('Test MongoDB disconnect failed:', err.message)
    }
}

module.exports = { connectTestDB, disconnectTestDB }
