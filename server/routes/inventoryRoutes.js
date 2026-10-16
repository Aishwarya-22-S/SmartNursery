const express = require('express')
const {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} = require('../controllers/inventoryController')
const { protect } = require('../middleware/authMiddleware')
const { authorize } = require('../middleware/roleMiddleware')

const router = express.Router()

// Inventory management is available to Admin and Staff; customers cannot
// read or mutate stock through either the UI or this API.
router.use(protect, authorize('admin', 'staff'))

router.get('/', getInventory)
router.post('/', createInventoryItem)
router.put('/:id', updateInventoryItem)
router.delete('/:id', deleteInventoryItem)

module.exports = router
