const mongoose = require('mongoose')

const cartItemSchema = new mongoose.Schema(
  {
    plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: '🌿' },
    imageUrl: { type: String, default: '' },
    size: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    qty: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
)

// One cart document per customer - matches the frontend's single flat
// `cart` array in AppContext, just persisted server-side instead of state.
const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
)

module.exports = mongoose.model('Cart', cartSchema)
