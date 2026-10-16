const mongoose = require('mongoose')

// Payment - one record per order, created alongside the order at checkout
// and updated by Admin/Staff from the Payment Verification page. Kept as
// its own collection (rather than just fields on Order) so payment history
// / verification metadata (verifiedAt, verifiedBy) has somewhere to live.
const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    orderNumber: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    transactionRef: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'verified', 'rejected', 'failed'], default: 'pending' },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Payment', paymentSchema)
