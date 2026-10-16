const express = require('express')
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserStatus,
  getProfile,
  updateProfile,
} = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware')
const { authorize } = require('../middleware/roleMiddleware')

const router = express.Router()

router.get('/profile', protect, getProfile)
router.put('/profile', protect, updateProfile)

router.get('/', protect, authorize('admin'), getUsers)
router.get('/:id', protect, authorize('admin'), getUserById)
router.put('/:id', protect, authorize('admin'), updateUser)
router.delete('/:id', protect, authorize('admin'), deleteUser)
router.put('/:id/status', protect, authorize('admin'), updateUserStatus)

module.exports = router
