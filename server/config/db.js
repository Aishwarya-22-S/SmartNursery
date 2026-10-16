const mongoose = require('mongoose')

// connectDB - opens the single shared MongoDB connection for the app.
// Called once from server.js on boot. Exits the process on failure so a
// broken DB connection never silently serves an app with no data layer.
async function connectDB() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.')
    process.exit(1)
  }

  try {
    const conn = await mongoose.connect(uri)
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`)
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  }
}

module.exports = connectDB
