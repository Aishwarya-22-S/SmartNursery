const express = require('express')
const { searchPlantHealth, getPlantHealthNames } = require('../controllers/plantHealthController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.use(protect)
router.get('/search', searchPlantHealth)
router.get('/names', getPlantHealthNames)

module.exports = router
