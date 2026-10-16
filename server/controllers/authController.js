const asyncHandler = require('../middleware/asyncHandler')
const User = require('../models/User')
const Settings = require('../models/Settings')
const generateToken = require('../utils/generateToken')

// Self-registration and new Google identities default to 'customer'. The
// separate development-only role-tag demo path below is never used by these
// endpoints and is disabled whenever NODE_ENV=production.
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body

  if (!name || !email || !password) {
    res.status(400)
    throw new Error('Name, email and password are required.')
  }
  if (password.length < 6) {
    res.status(400)
    throw new Error('Password must be at least 6 characters.')
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() })
  if (existing) {
    res.status(400)
    throw new Error('An account with that email already exists.')
  }

  const user = await User.create({
    name,
    email: email.toLowerCase().trim(),
    password,
    phone: phone || '',
    role: 'customer',
  })
  await Settings.create({ user: user._id })

  res.status(201).json({
    success: true,
    token: generateToken(user),
    user: user.toPublicJSON(),
  })
})

// Demo convenience: in local development only, a new account may be created
// on first login when the email local-part ends in .admin, .staff, or
// .customer. This is intentionally disabled whenever NODE_ENV=production.
function roleTagFromEmail(email) {
  const localPart = String(email).toLowerCase().trim().split('@')[0] || ''
  const tokens = localPart.split(/[.+_-]+/).filter(Boolean)
  const tag = tokens[tokens.length - 1]
  return ['admin', 'staff', 'customer'].includes(tag) ? tag : null
}

function displayNameFromEmail(email, role) {
  const localPart = String(email).toLowerCase().trim().split('@')[0] || ''
  const parts = localPart.split(/[.+_-]+/).filter((part) => part && part !== role)
  const words = parts.length ? parts : [role]
  return words.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
}

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400)
    throw new Error('Email and password are required.')
  }

  const normalizedEmail = String(email).toLowerCase().trim()
  let user = await User.findOne({ email: normalizedEmail }).select('+password')

  // Never reassign the role of an existing account based on its email text.
  // Only create a missing tagged account in the explicitly enabled dev demo.
  const demoRoleLoginEnabled = process.env.NODE_ENV !== 'production'
    && process.env.EMAIL_ROLE_DEMO_MODE === 'true'
  if (!user && demoRoleLoginEnabled) {
    const role = roleTagFromEmail(normalizedEmail)
    if (role) {
      if (String(password).length < 6) {
        res.status(400)
        throw new Error('Password must be at least 6 characters for a new demo account.')
      }
      try {
        user = await User.create({
          name: displayNameFromEmail(normalizedEmail, role),
          email: normalizedEmail,
          password,
          role,
        })
        await Settings.create({ user: user._id })
      } catch (error) {
        if (error.code !== 11000) throw error
        user = await User.findOne({ email: normalizedEmail }).select('+password')
      }
    }
  }

  if (!user || !(await user.comparePassword(password))) {
    res.status(401)
    throw new Error('Invalid email or password.')
  }
  if (user.status === 'suspended') {
    res.status(403)
    throw new Error('This account has been suspended. Contact an administrator.')
  }

  res.json({
    success: true,
    token: generateToken(user),
    user: user.toPublicJSON(),
  })
})

// googleAuth - upserts a user record from a Firebase-verified Google
// profile the frontend already obtained (see src/services/authService.js).
// This lets a Google sign-in get its own real backend session (JWT + a
// persistent cart/wishlist/orders) instead of only existing client-side.
const googleAuth = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body
  if (!email) {
    res.status(400)
    throw new Error('Google account had no email address.')
  }

  let user = await User.findOne({ email: String(email).toLowerCase().trim() })
  if (!user) {
    // Random password - this account only ever authenticates via Google,
    // but the schema requires a password field, so a throwaway secure
    // value is generated and never given back to the client.
    const randomPassword = require('crypto').randomBytes(24).toString('hex')
    user = await User.create({
      name: name || 'Google User',
      email: String(email).toLowerCase().trim(),
      password: randomPassword,
      phone: phone || '',
      role: 'customer',
      authProvider: 'google',
    })
    await Settings.create({ user: user._id })
  }

  if (user.status === 'suspended') {
    res.status(403)
    throw new Error('This account has been suspended. Contact an administrator.')
  }

  res.json({
    success: true,
    token: generateToken(user),
    user: user.toPublicJSON(),
  })
})

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON() })
})

// logout - JWTs are stateless, so there's nothing to invalidate
// server-side; this just gives the frontend a consistent endpoint to call.
const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out.' })
})

module.exports = { register, login, googleAuth, me, logout }
