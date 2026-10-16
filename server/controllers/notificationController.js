const asyncHandler = require('../middleware/asyncHandler')
const Notification = require('../models/Notification')

// getNotifications - visible to a user if it's addressed to their specific
// user id, OR it has no roles/no user restriction (global), OR their role
// is in its roles list. Mirrors the frontend's client-side filter:
//   notifications.filter(n => !n.roles || n.roles.includes(user.role))
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    $and: [
      { $or: [{ user: null }, { user: req.user._id }] },
      { $or: [{ roles: { $size: 0 } }, { roles: req.user.role }] },
    ],
  }).sort({ createdAt: -1 })
  res.json({ success: true, notifications })
})

const createNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.create(req.body)
  res.status(201).json({ success: true, notification })
})

const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id)
  if (!notification) {
    res.status(404)
    throw new Error('Notification not found.')
  }
  notification.read = req.body.read !== undefined ? req.body.read : !notification.read
  await notification.save()
  res.json({ success: true, notification })
})

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      $and: [
        { $or: [{ user: null }, { user: req.user._id }] },
        { $or: [{ roles: { $size: 0 } }, { roles: req.user.role }] },
      ],
    },
    { $set: { read: true } }
  )
  res.json({ success: true })
})

const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id)
  if (!notification) {
    res.status(404)
    throw new Error('Notification not found.')
  }
  await notification.deleteOne()
  res.json({ success: true, message: 'Notification deleted.' })
})

module.exports = { getNotifications, createNotification, markRead, markAllRead, deleteNotification }
