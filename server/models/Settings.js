const mongoose = require('mongoose')

// Settings - one document per user, persisting exactly the preferences the
// existing SettingsMenu.jsx already exposes: font size, language, theme
// and accent color. Guests keep using localStorage only (see frontend
// AppContext) since there's no user to attach a document to yet.
const settingsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    language: { type: String, enum: ['en', 'ta'], default: 'en' },
    accentColor: {
      type: String,
      enum: ['green', 'blue', 'purple', 'orange', 'red', 'teal'],
      default: 'green',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Settings', settingsSchema)
