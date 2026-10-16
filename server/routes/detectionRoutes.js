const express = require('express')
const { getMyDetections, createDetection } = require('../controllers/detectionController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.use(protect)
router.get('/', getMyDetections)
router.post('/', createDetection)

module.exports = router
