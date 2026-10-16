const asyncHandler = require('../middleware/asyncHandler')
const Settings = require('../models/Settings')

const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ user: req.user._id })
  if (!settings) settings = await Settings.create({ user: req.user._id })
  res.json({ success: true, settings })
})

// updateSettings - persists exactly the preferences SettingsMenu.jsx
// already exposes (theme, fontSize, language, accentColor). Frontend
// still mirrors these into localStorage for instant paint on next load,
// but this document is the durable source of truth per user.
const updateSettings = asyncHandler(async (req, res) => {
  const { theme, fontSize, language, accentColor } = req.body
  let settings = await Settings.findOne({ user: req.user._id })
  if (!settings) settings = new Settings({ user: req.user._id })
  if (theme !== undefined) settings.theme = theme
  if (fontSize !== undefined) settings.fontSize = fontSize
  if (language !== undefined) settings.language = language
  if (accentColor !== undefined) settings.accentColor = accentColor
  await settings.save()
  res.json({ success: true, settings })
})

module.exports = { getSettings, updateSettings }
