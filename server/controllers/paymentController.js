const asyncHandler = require('../middleware/asyncHandler')
const Payment = require('../models/Payment')
const Order = require('../models/Order')
const Notification = require('../models/Notification')
const { findOrder } = require('./orderController')

const getPayments = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'customer' ? { user: req.user._id } : {}
  const payments = await Payment.find(filter).sort({ createdAt: -1 })
  res.json({ success: true, payments })
})

const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
  if (!payment) {
    res.status(404)
    throw new Error('Payment not found.')
  }
  if (req.user.role === 'customer' && String(payment.user) !== String(req.user._id)) {
    res.status(403)
    throw new Error('You cannot view another customer\'s payment.')
  }
  res.json({ success: true, payment })
})

// createPayment - normally created automatically by placeOrder(); exposed
// separately for cases like retrying a failed payment record.
const createPayment = asyncHandler(async (req, res) => {
  const { orderId, amount, paymentMethod, transactionRef } = req.body
  const order = await Order.findById(orderId)
  if (!order) {
    res.status(404)
    throw new Error('Order not found.')
  }
  const payment = await Payment.create({
    order: order._id,
    orderNumber: order.orderNumber,
    user: req.user._id,
    amount: amount ?? order.totalAmount,
    paymentMethod: paymentMethod || order.paymentMethod,
    transactionRef: transactionRef || '',
    status: 'pending',
  })
  res.status(201).json({ success: true, payment })
})

// verifyPayment - Admin/Staff action from Payment Verification page.
// Updates both the Payment record and the parent Order's paymentStatus so
// they never drift out of sync, and notifies the customer.
const verifyPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
  if (!payment) {
    res.status(404)
    throw new Error('Payment not found.')
  }
  payment.status = 'verified'
  payment.verifiedAt = new Date()
  payment.verifiedBy = req.user._id
  await payment.save()

  const order = await Order.findById(payment.order)
  if (order) {
    order.paymentStatus = 'Verified'
    await order.save()
    await Notification.create({
      icon: '✅',
      title: 'Payment Verified',
      message: `Payment for order ${order.orderNumber} has been verified.`,
      roles: ['customer'],
      user: order.user,
      group: 'Orders',
    })
  }

  res.json({ success: true, payment })
})

// verifyPaymentByOrder - convenience endpoint for PaymentVerification.jsx,
// which only knows the order's display id (orderNumber, e.g. "ORD-1234"),
// not the underlying payment's Mongo id. Resolves the order first (by
// _id or orderNumber, same as orderController.findOrder), then looks up
// its payment record and reuses the same verification logic.
const verifyPaymentByOrder = asyncHandler(async (req, res) => {
  const order = await findOrder(req.params.orderId)
  if (!order) {
    res.status(404)
    throw new Error('Order not found.')
  }
  const payment = await Payment.findOne({ order: order._id }).sort({ createdAt: -1 })
  if (!payment) {
    res.status(404)
    throw new Error('No payment record found for that order.')
  }
  req.params.id = payment._id.toString()
  return verifyPayment(req, res)
})

// rejectPayment - Admin/Staff action from Payment Verification page for a
// payment that looks wrong/fraudulent. Mirrors verifyPayment but marks
// both the Payment and the parent Order as Rejected and notifies the
// customer, instead of silently doing nothing (section 1.D of the spec).
const rejectPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
  if (!payment) {
    res.status(404)
    throw new Error('Payment not found.')
  }
  payment.status = 'rejected'
  payment.verifiedAt = new Date()
  payment.verifiedBy = req.user._id
  await payment.save()

  const order = await Order.findById(payment.order)
  if (order) {
    order.paymentStatus = 'Rejected'
    await order.save()
    await Notification.create({
      icon: '❌',
      title: 'Payment Rejected',
      message: `Payment for order ${order.orderNumber} was rejected. Please contact support.`,
      roles: ['customer'],
      user: order.user,
      group: 'Alerts',
    })
  }

  res.json({ success: true, payment })
})

// rejectPaymentByOrder - convenience endpoint mirroring verifyPaymentByOrder.
const rejectPaymentByOrder = asyncHandler(async (req, res) => {
  const order = await findOrder(req.params.orderId)
  if (!order) {
    res.status(404)
    throw new Error('Order not found.')
  }
  const payment = await Payment.findOne({ order: order._id }).sort({ createdAt: -1 })
  if (!payment) {
    res.status(404)
    throw new Error('No payment record found for that order.')
  }
  req.params.id = payment._id.toString()
  return rejectPayment(req, res)
})

module.exports = { getPayments, getPaymentById, createPayment, verifyPayment, verifyPaymentByOrder, rejectPayment, rejectPaymentByOrder }
