const mongoose = require('mongoose')

// PlantHealth - one record per Plant. Admin/Staff/Customer "Plant Health
// Monitoring" pages all search a plant by name and read/display THIS
// record, instead of one hard-coded plant. No physical sensors are wired
// up in this project, so every value here is clearly simulated/demo data
// that lives in MongoDB (isSimulated: true) rather than pretending to be
// a live IoT feed.
const historyEntrySchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    growth: { type: Number, min: 0, max: 100 },
    soilMoisture: { type: Number, min: 0, max: 100 },
    waterLevel: { type: Number, min: 0, max: 100 },
    healthStatus: { type: String, enum: ['Good', 'Moderate', 'Poor'], default: 'Good' },
    observation: { type: String, default: '' },
  },
  { _id: false }
)

const alertSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
)

const plantHealthSchema = new mongoose.Schema(
  {
    plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true, unique: true },
    plantName: { type: String, required: true },
    growth: { type: Number, min: 0, max: 100, default: 70 },
    waterLevel: { type: Number, min: 0, max: 100, default: 70 },
    soilMoisture: { type: Number, min: 0, max: 100, default: 55 },
    sunlightHours: { type: Number, min: 0, max: 14, default: 6 },
    temperature: { type: Number, default: 27 },
    overallHealthScore: { type: Number, min: 0, max: 100, default: 85 },
    healthStatus: { type: String, enum: ['Good', 'Moderate', 'Poor'], default: 'Good' },
    lastChecked: { type: Date, default: Date.now },
    isSimulated: { type: Boolean, default: true },
    history: [historyEntrySchema],
    alerts: [alertSchema],
  },
  { timestamps: true }
)

module.exports = mongoose.model('PlantHealth', plantHealthSchema)
