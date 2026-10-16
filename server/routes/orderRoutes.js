const express = require('express')
const {
  placeOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
} = require('../controllers/orderController')
const { protect } = require('../middleware/authMiddleware')
const { authorize } = require('../middleware/roleMiddleware')

const router = express.Router()

router.use(protect)

router.post('/', authorize('customer'), placeOrder)
router.get('/', getOrders) // customers see their own; admin/staff see all
router.get('/:id', getOrderById)
router.put('/:id/status', authorize('admin', 'staff'), updateOrderStatus)
router.put('/:id/cancel', authorize('admin', 'staff'), cancelOrder)
router.delete('/:id', authorize('admin'), deleteOrder)

module.exports = router
