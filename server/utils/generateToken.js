const jwt = require('jsonwebtoken')

// generateToken - signs a JWT carrying just the user id and role. The role
// is embedded so roleMiddleware can check it without a DB round trip, but
// authMiddleware still re-fetches the user on every request so a role
// change or suspension takes effect immediately, not just on next login.
function generateToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

module.exports = generateToken
