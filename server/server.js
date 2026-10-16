require('dotenv').config()

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const connectDB = require('./config/db')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const plantRoutes = require('./routes/plantRoutes')
const cartRoutes = require('./routes/cartRoutes')
const wishlistRoutes = require('./routes/wishlistRoutes')
const orderRoutes = require('./routes/orderRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const inventoryRoutes = require('./routes/inventoryRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const settingsRoutes = require('./routes/settingsRoutes')
const plantHealthRoutes = require('./routes/plantHealthRoutes')
const detectionRoutes = require('./routes/detectionRoutes')
const careRoutes = require('./routes/careRoutes')

connectDB()

const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json({ limit: '5mb' }))
app.use(cookieParser())

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend server is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/plants', plantRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/plant-health', plantHealthRoutes)
app.use('/api/detections', detectionRoutes)
app.use('/api/care', careRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`GreenLeaf Nursery backend running on http://localhost:${PORT}`)
})
