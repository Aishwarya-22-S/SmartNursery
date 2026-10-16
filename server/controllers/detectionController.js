const asyncHandler = require('../middleware/asyncHandler')
const Detection = require('../models/Detection')
const Notification = require('../models/Notification')

// Simulated/demo disease results - no real ML model is connected. Kept as
// a small, varied pool so repeated demo uploads don't all look identical,
// the same way the original frontend's dummy setTimeout logic worked -
// the only difference is every result is now actually saved to MongoDB.
const RESULT_POOL = [
  { disease: 'Leaf Spot Disease', status: 'Diseased', advice: 'Remove affected leaves and reduce watering frequency.' },
  { disease: 'Early Blight', status: 'Diseased', advice: 'Apply a copper-based fungicide and avoid overhead watering.' },
  { disease: 'Powdery Mildew', status: 'Diseased', advice: 'Improve air circulation and treat with a mild fungicide spray.' },
  { disease: 'Healthy', status: 'Healthy', advice: 'No signs of disease detected. Keep up the current care routine.' },
  { disease: 'Root Rot (early signs)', status: 'Diseased', advice: 'Reduce watering and check drainage; repot if soil stays soggy.' },
]

const getMyDetections = asyncHandler(async (req, res) => {
  const detections = await Detection.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.json({ success: true, detections })
})

// createDetection - runs the simulated analysis and persists the result,
// so "Recent Detection" is built from real previous detections made by
// the logged-in user (Admin/Staff/Customer), not a fixed sample pair.
const createDetection = asyncHandler(async (req, res) => {
  const { image, plantName } = req.body
  if (!image) {
    res.status(400)
    throw new Error('An image is required to run detection.')
  }

  const picked = RESULT_POOL[Math.floor(Math.random() * RESULT_POOL.length)]
  const confidence = 82 + Math.round(Math.random() * 16)

  const detection = await Detection.create({
    user: req.user._id,
    plantName: plantName || '',
    image,
    disease: picked.disease,
    confidence,
    status: picked.status,
    advice: picked.advice,
  })

  if (picked.status === 'Diseased' && (req.user.role === 'customer' || req.user.role === 'staff')) {
    await Notification.create({
      icon: '🩺',
      title: 'Disease Detection Result',
      message: `Possible ${picked.disease} detected${plantName ? ` on ${plantName}` : ''}.`,
      roles: [req.user.role],
      user: req.user._id,
      group: 'Alerts',
    })
  }

  res.status(201).json({ success: true, detection })
})

module.exports = { getMyDetections, createDetection }
