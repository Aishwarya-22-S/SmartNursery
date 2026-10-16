const express = require('express')
const {
  getPlants,
  getPlantById,
  createPlant,
  updatePlant,
  deletePlant,
  restockPlant,
} = require('../controllers/plantController')
const { protect } = require('../middleware/authMiddleware')
const { authorize } = require('../middleware/roleMiddleware')

const router = express.Router()

router.get('/', getPlants)
router.get('/:id', getPlantById)

router.post('/', protect, authorize('admin'), createPlant)
router.put('/:id', protect, authorize('admin'), updatePlant)
router.delete('/:id', protect, authorize('admin'), deletePlant)
router.put('/:id/restock', protect, authorize('admin'), restockPlant)

module.exports = router
