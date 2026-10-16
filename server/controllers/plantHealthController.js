const asyncHandler = require('../middleware/asyncHandler')
const Plant = require('../models/Plant')
const PlantHealth = require('../models/PlantHealth')

// buildSimulatedRecord - used the first time anyone looks up a plant that
// doesn't have a PlantHealth document yet (e.g. a plant Admin just added
// through Inventory). Keeps the monitoring page working for every plant,
// not only the ones seed data pre-populated, while still storing the
// result in MongoDB (not just returning throwaway numbers) so it becomes
// this plant's real record from then on.
async function buildSimulatedRecord(plant) {
  const growth = 55 + Math.round(Math.random() * 35)
  const waterLevel = 40 + Math.round(Math.random() * 50)
  const soilMoisture = 30 + Math.round(Math.random() * 55)
  const overallHealthScore = Math.round((growth + waterLevel + soilMoisture) / 3)
  const healthStatus = overallHealthScore >= 75 ? 'Good' : overallHealthScore >= 50 ? 'Moderate' : 'Poor'

  const alerts = []
  if (soilMoisture < 35) alerts.push({ type: 'soil', message: 'Low soil moisture detected. Water soon.', severity: 'high' })
  if (waterLevel < 35) alerts.push({ type: 'water', message: 'Water level is running low.', severity: 'medium' })
  if (growth < 50) alerts.push({ type: 'growth', message: 'Growth is slower than expected for this plant.', severity: 'medium' })
  if (soilMoisture > 85) alerts.push({ type: 'excess-water', message: 'Soil moisture is very high - risk of overwatering.', severity: 'medium' })

  const record = await PlantHealth.create({
    plant: plant._id,
    plantName: plant.name,
    growth,
    waterLevel,
    soilMoisture,
    sunlightHours: 4 + Math.round(Math.random() * 6),
    temperature: 22 + Math.round(Math.random() * 10),
    overallHealthScore,
    healthStatus,
    lastChecked: new Date(),
    history: [
      { date: new Date(), growth, soilMoisture, waterLevel, healthStatus, observation: 'Baseline demo reading generated on first check.' },
    ],
    alerts,
  })
  return record
}

// searchPlantHealth - GET /api/plant-health/search?name=mango. Case
// insensitive, matches the way section 5 of the spec asks search to
// behave ("mango" / "Mango" / "MANGO" all find Mango).
const searchPlantHealth = asyncHandler(async (req, res) => {
  const name = (req.query.name || '').trim()
  if (!name) {
    res.status(400)
    throw new Error('Provide a plant name to search for.')
  }
  const plant = await Plant.findOne({ name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') })
    || await Plant.findOne({ name: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') })

  if (!plant) {
    res.status(404)
    throw new Error(`No plant found matching "${name}".`)
  }

  let health = await PlantHealth.findOne({ plant: plant._id })
  if (!health) health = await buildSimulatedRecord(plant)

  res.json({ success: true, plant, health })
})

// getPlantHealthNames - lets the frontend offer suggestions / validate as
// the user types, without loading the whole catalog again.
const getPlantHealthNames = asyncHandler(async (req, res) => {
  const plants = await Plant.find().select('name emoji').sort({ name: 1 })
  res.json({ success: true, plants })
})

module.exports = { searchPlantHealth, getPlantHealthNames }
