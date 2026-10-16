const express = require('express')
const { searchCareGuide } = require('../controllers/careController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

// Care guide is readable by any logged-in role (Customer is the primary
// user, but Admin/Staff can look plants up too).
router.use(protect)
router.get('/search', searchCareGuide)

module.exports = router
