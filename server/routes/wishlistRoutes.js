const express = require('express')
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController')
const { protect } = require('../middleware/authMiddleware')
const { authorize } = require('../middleware/roleMiddleware')

const router = express.Router()

router.use(protect, authorize('customer'))

router.get('/', getWishlist)
router.post('/', addToWishlist)
router.delete('/:plantId', removeFromWishlist)

module.exports = router
