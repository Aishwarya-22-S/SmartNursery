const asyncHandler = require('../middleware/asyncHandler')
const User = require('../models/User')

// getUsers - admin-only user management list (User Management page).
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 })
  res.json({ success: true, users: users.map((u) => u.toPublicJSON()) })
})

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found.')
  }
  res.json({ success: true, user: user.toPublicJSON() })
})

// updateUser - admin editing another user's core fields. Role can be
// changed here (admin-only action) - this is intentionally separate from
// Profile self-editing, which never allows changing role (see
// updateProfile below / Profile.jsx on the frontend).
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found.')
  }
  const { name, phone, role } = req.body
  if (name !== undefined) user.name = name
  if (phone !== undefined) user.phone = phone
  if (role !== undefined) user.role = role
  await user.save()
  res.json({ success: true, user: user.toPublicJSON() })
})

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found.')
  }
  await user.deleteOne()
  res.json({ success: true, message: 'User deleted.' })
})

const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  if (!['active', 'suspended'].includes(status)) {
    res.status(400)
    throw new Error('Status must be "active" or "suspended".')
  }
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found.')
  }
  user.status = status
  await user.save()
  res.json({ success: true, user: user.toPublicJSON() })
})

// getProfile / updateProfile - the logged-in user's own profile
// (Profile.jsx). Mirrors the frontend's updateProfile(): role is
// explicitly stripped out of the update payload so a customer can never
// self-promote by editing the profile form.
const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON() })
})

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, email } = req.body
  if (name !== undefined) req.user.name = name
  if (phone !== undefined) req.user.phone = phone
  if (email !== undefined && email !== req.user.email) {
    const taken = await User.findOne({ email: String(email).toLowerCase().trim() })
    if (taken) {
      res.status(400)
      throw new Error('That email is already in use.')
    }
    req.user.email = String(email).toLowerCase().trim()
  }
  await req.user.save()
  res.json({ success: true, user: req.user.toPublicJSON() })
})

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserStatus,
  getProfile,
  updateProfile,
}
