const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema(
  {
    plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant' },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
  },
  { _id: false }
)

const ORDER_STAGES = [
  'stagePlaced',
  'stageConfirmed',
  'stagePacked',
  'stageTransit',
  'stageOutDelivery',
  'stageDelivered',
  'stageCancelled',
]

// Order - `orderNumber` keeps the existing frontend's human-friendly
// "ORD-1234" id format (used as the visible order id everywhere), separate
// from Mongo's internal _id.
const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 40 },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Verified', 'Rejected', 'Failed'], default: 'Pending' },
    orderStatus: { type: String, enum: ORDER_STAGES, default: 'stagePlaced' },
    address: {
      name: String,
      street: String,
      state: String,
      phone: String,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Order', orderSchema)
module.exports.ORDER_STAGES = ORDER_STAGES
