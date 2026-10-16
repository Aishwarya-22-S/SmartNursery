const jwt = require('jsonwebtoken')
const asyncHandler = require('./asyncHandler')
const User = require('../models/User')

// protect - requires a valid "Authorization: Bearer <token>" header.
// Loads the real user from MongoDB on every request (not just from the
// token payload) so a suspended/deleted account or a role change is
// enforced immediately, and attaches it as req.user for downstream
// controllers and roleMiddleware.
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    res.status(401)
    throw new Error('Not authenticated. Please log in.')
  }

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    res.status(401)
    throw new Error('Session expired or invalid. Please log in again.')
  }

  const user = await User.findById(decoded.id)
  if (!user) {
    res.status(401)
    throw new Error('Account no longer exists.')
  }
  if (user.status === 'suspended') {
    res.status(403)
    throw new Error('This account has been suspended.')
  }

  req.user = user
  next()
})

module.exports = { protect }
