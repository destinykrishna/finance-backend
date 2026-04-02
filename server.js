require('dotenv').config()
const app = require('./src/app')

const connectDB = require('./src/config/db')
connectDB()

const PORT = process.env.PORT || 5000

let server;
if (require.main === module) {
  // Only start server if this file is run directly (not imported for testing)
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

module.exports = { app, server }