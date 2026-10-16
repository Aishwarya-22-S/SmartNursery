const express = require('express')
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cartController')
const { protect } = require('../middleware/authMiddleware')
const { authorize } = require('../middleware/roleMiddleware')

const router = express.Router()

// Cart is customer-owned; admin/staff never need someone else's cart.
router.use(protect, authorize('customer'))

router.get('/', getCart)
router.post('/', addToCart)
router.put('/:itemId', updateCartItem)
router.delete('/:itemId', removeCartItem)
router.delete('/', clearCart)

module.exports = router
