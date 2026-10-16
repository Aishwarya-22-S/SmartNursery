const express = require('express')
const {
  getPayments,
  getPaymentById,
  createPayment,
  verifyPayment,
  verifyPaymentByOrder,
  rejectPayment,
  rejectPaymentByOrder,
} = require('../controllers/paymentController')
const { protect } = require('../middleware/authMiddleware')
const { authorize } = require('../middleware/roleMiddleware')

const router = express.Router()

router.use(protect)

router.post('/', authorize('customer'), createPayment)
router.get('/', getPayments)
router.get('/:id', getPaymentById)
router.put('/:id/verify', authorize('admin', 'staff'), verifyPayment)
router.put('/by-order/:orderId/verify', authorize('admin', 'staff'), verifyPaymentByOrder)
router.put('/:id/reject', authorize('admin', 'staff'), rejectPayment)
router.put('/by-order/:orderId/reject', authorize('admin', 'staff'), rejectPaymentByOrder)

module.exports = router
