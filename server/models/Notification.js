const mongoose = require('mongoose')

// Notification - matches the frontend's notification shape exactly
// (icon, titleKey/title, msgKey/message, group, read, roles). `roles`
// controls visibility the same way it did on the frontend's hard-coded
// list (omitted/empty = visible to everyone); `user` optionally scopes a
// notification to one specific customer (e.g. "your order shipped").
const notificationSchema = new mongoose.Schema(
  {
    icon: { type: String, default: '🔔' },
    titleKey: { type: String, default: '' },
    msgKey: { type: String, default: '' },
    title: { type: String, default: '' },
    message: { type: String, default: '' },
    group: { type: String, default: 'Alerts' },
    roles: { type: [String], default: [] },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Notification', notificationSchema)
