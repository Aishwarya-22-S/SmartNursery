const mongoose = require('mongoose')
const asyncHandler = require('../middleware/asyncHandler')
const Order = require('../models/Order')
const Payment = require('../models/Payment')
const Plant = require('../models/Plant')
const Notification = require('../models/Notification')
const { getOrCreateCart } = require('./cartController')

const DELIVERY_CHARGE = 40

// findOrder - the frontend carries the human-friendly orderNumber
// ("ORD-1234") around as an order's "id" everywhere (Order History,
// Payment Verification, Staff order actions), rather than Mongo's
// internal _id. Routes that take an order id accept either so the
// frontend never has to be taught about _id at all.
async function findOrder(idOrNumber) {
  if (mongoose.Types.ObjectId.isValid(idOrNumber)) {
    const byId = await Order.findById(idOrNumber)
    if (byId) return byId
  }
  return Order.findOne({ orderNumber: idOrNumber })
}

function generateOrderNumber() {
  return `ORD-${Math.floor(1000 + Math.random() * 9000)}`
}

// placeOrder - the backend half of AppContext.placeOrder(). The cart and
// therefore the total are read from the customer's persisted server-side
// Cart document, never from the request body, so nothing the client sends
// can inflate/deflate the amount charged. Stock is validated and
// decremented, a Payment record is created, and Admin/Staff are notified -
// same sequence the original frontend's context function performed
// client-side only.
const placeOrder = asyncHandler(async (req, res) => {
  const { paymentMethod, address } = req.body
  if (!paymentMethod) {
    res.status(400)
    throw new Error('A payment method is required.')
  }

  const cart = await getOrCreateCart(req.user._id)
  if (!cart.items.length) {
    res.status(400)
    throw new Error('Your cart is empty.')
  }

  // Validate stock for every item that references a real Plant record.
  const plantIds = cart.items.filter((i) => i.plant).map((i) => i.plant)
  const plants = await Plant.find({ _id: { $in: plantIds } })
  const plantById = new Map(plants.map((p) => [String(p._id), p]))

  for (const item of cart.items) {
    if (!item.plant) continue
    const plant = plantById.get(String(item.plant))
    if (!plant) {
      res.status(400)
      throw new Error(`"${item.name}" is no longer available.`)
    }
    if (plant.qty < item.qty) {
      res.status(400)
      throw new Error(`Not enough stock for "${item.name}". Only ${plant.qty} left.`)
    }
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const totalAmount = subtotal + DELIVERY_CHARGE

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user._id,
    customerName: req.user.name,
    customerEmail: req.user.email,
    items: cart.items.map((i) => ({ plant: i.plant, name: i.name, qty: i.qty, price: i.price })),
    totalAmount,
    deliveryCharge: DELIVERY_CHARGE,
    paymentMethod,
    paymentStatus: 'Pending',
    orderStatus: 'stagePlaced',
    address,
  })

  // Decrement stock now that the order is confirmed.
  for (const item of cart.items) {
    if (!item.plant) continue
    await Plant.updateOne({ _id: item.plant }, { $inc: { qty: -item.qty } })
  }

  await Payment.create({
    order: order._id,
    orderNumber: order.orderNumber,
    user: req.user._id,
    amount: totalAmount,
    paymentMethod,
    status: 'pending',
  })

  cart.items = []
  await cart.save()

  await Notification.create({
    icon: '📦',
    title: 'New Order',
    message: `${req.user.name} placed order ${order.orderNumber} for ₹${totalAmount}.`,
    roles: ['admin', 'staff'],
    group: 'Orders',
  })
  await Notification.create({
    icon: '💳',
    title: 'Payment Pending Verification',
    message: `Payment for order ${order.orderNumber} needs verification.`,
    roles: ['admin', 'staff'],
    group: 'Alerts',
  })

  res.status(201).json({ success: true, order })
})

// getOrders - customers see only their own orders; admin/staff see every
// order (Order History is customer-only in the frontend; Payment
// Verification / staff order processing needs the full list).
const getOrders = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'customer' ? { user: req.user._id } : {}
  const orders = await Order.find(filter).sort({ createdAt: -1 })
  res.json({ success: true, orders })
})

const getOrderById = asyncHandler(async (req, res) => {
  const order = await findOrder(req.params.id)
  if (!order) {
    res.status(404)
    throw new Error('Order not found.')
  }
  if (req.user.role === 'customer' && String(order.user) !== String(req.user._id)) {
    res.status(403)
    throw new Error('You cannot view another customer\'s order.')
  }
  res.json({ success: true, order })
})

// updateOrderStatus - Staff/Admin advancing the order through the
// tracking timeline (StaffDashboard "Advance" button / OrderTracking).
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body
  const order = await findOrder(req.params.id)
  if (!order) {
    res.status(404)
    throw new Error('Order not found.')
  }
  order.orderStatus = orderStatus
  await order.save()

  await Notification.create({
    icon: '🚚',
    title: 'Order Status Updated',
    message: `Order ${order.orderNumber} status changed.`,
    roles: ['customer'],
    user: order.user,
    group: 'Orders',
  })

  res.json({ success: true, order })
})

const deleteOrder = asyncHandler(async (req, res) => {
  const order = await findOrder(req.params.id)
  if (!order) {
    res.status(404)
    throw new Error('Order not found.')
  }
  await order.deleteOne()
  res.json({ success: true, message: 'Order deleted.' })
})

// cancelOrder - Admin/Staff cancelling an order (e.g. out of stock, fraud,
// customer request by phone). Restocks any plant items so Inventory stays
// accurate, and notifies the customer. Used by the Admin "Staff Dashboard"
// cancelled-orders count (section 1.A of the spec).
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await findOrder(req.params.id)
  if (!order) {
    res.status(404)
    throw new Error('Order not found.')
  }
  if (order.orderStatus === 'stageDelivered') {
    res.status(400)
    throw new Error('A delivered order cannot be cancelled.')
  }
  if (order.orderStatus === 'stageCancelled') {
    res.status(400)
    throw new Error('This order is already cancelled.')
  }

  for (const item of order.items) {
    if (!item.plant) continue
    await Plant.updateOne({ _id: item.plant }, { $inc: { qty: item.qty } })
  }

  order.orderStatus = 'stageCancelled'
  await order.save()

  await Notification.create({
    icon: '🚫',
    title: 'Order Cancelled',
    message: `Order ${order.orderNumber} was cancelled.`,
    roles: ['customer'],
    user: order.user,
    group: 'Orders',
  })

  res.json({ success: true, order })
})

module.exports = { placeOrder, getOrders, getOrderById, updateOrderStatus, cancelOrder, deleteOrder, findOrder }
