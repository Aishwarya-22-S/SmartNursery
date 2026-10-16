const mongoose = require('mongoose')

const wishlistItemSchema = new mongoose.Schema(
  {
    plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: '🌿' },
  },
  { _id: false }
)

// One wishlist document per customer, matching the frontend's flat
// `wishlist` array. Wishlist items are user-specific - Customer A's
// wishlist document is never readable by Customer B (enforced in the
// controller, which always scopes by req.user.id).
const wishlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [wishlistItemSchema],
  },
  { timestamps: true }
)

module.exports = mongoose.model('Wishlist', wishlistSchema)
