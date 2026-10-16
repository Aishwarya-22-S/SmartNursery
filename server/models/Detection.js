const mongoose = require('mongoose')

// Detection - one row per AI Disease Detection run. Saved for whichever
// user (Admin/Staff/Customer) performed it, so "Recent Detection" always
// shows that logged-in user's own real history instead of a hard-coded
// sample pair. No real ML model is wired up in this project - the image
// is analyzed with a simulated/demo result, exactly like the original
// frontend's dummy setTimeout logic, just persisted now.
const detectionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plantName: { type: String, default: '' },
    image: { type: String, default: '' }, // data URL of the uploaded leaf photo
    disease: { type: String, required: true },
    confidence: { type: Number, required: true },
    status: { type: String, enum: ['Healthy', 'Diseased'], default: 'Diseased' },
    advice: { type: String, default: '' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Detection', detectionSchema)
