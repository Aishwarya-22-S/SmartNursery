const express = require('express')
const { register, login, googleAuth, me, logout } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/google', googleAuth)
router.get('/me', protect, me)
router.post('/logout', protect, logout)

module.exports = router
