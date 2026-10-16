const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const ROLES = ['admin', 'staff', 'customer']

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, default: '' },
    role: { type: String, enum: ROLES, default: 'customer' },
    rewardPoints: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  },
  { timestamps: true }
)

// Hash the password whenever it's set/changed - never store plain text.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password)
}

// toPublicJSON - the shape sent to the frontend (never includes password).
// Matches the fields the existing frontend already expects on `user`.
userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    rewardPoints: this.rewardPoints,
    status: this.status,
  }
}

module.exports = mongoose.model('User', userSchema)
module.exports.ROLES = ROLES
