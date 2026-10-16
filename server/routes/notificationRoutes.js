const express = require('express')
const {
  getNotifications,
  createNotification,
  markRead,
  markAllRead,
  deleteNotification,
} = require('../controllers/notificationController')
const { protect } = require('../middleware/authMiddleware')
const { authorize } = require('../middleware/roleMiddleware')

const router = express.Router()

router.use(protect)

// Section 1.H of the spec: Admin has no Notifications module at all. Block
// it here too (not just by hiding the sidebar link/route on the frontend)
// so a direct API call from an Admin session can't read notifications
// either - it always gets an empty list.
router.get('/', (req, res, next) => {
  if (req.user.role === 'admin') {
    return res.json({ success: true, notifications: [] })
  }
  next()
}, getNotifications)
router.post('/', authorize('admin', 'staff'), createNotification)
router.put('/:id/read', markRead)
router.put('/read-all', markAllRead)
router.delete('/:id', deleteNotification)

module.exports = router
