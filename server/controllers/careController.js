const asyncHandler = require('../middleware/asyncHandler')
const Plant = require('../models/Plant')

const CATEGORY_LABELS = {
  catIndoor: 'an indoor plant',
  catOutdoor: 'an outdoor plant',
  catSucculents: 'a succulent',
  catFlowering: 'a flowering plant',
  catFruit: 'a fruit plant',
  catAir: 'an air-purifying plant',
}

// buildCareGuide - generates a realistic, plant-specific care guide from
// whatever this Plant record already knows about it (category, sunlight
// and water needs, soil type, fertilizer info), so no two plants ever show
// literally the same text purely by coincidence of category. Persisted on
// the Plant document afterwards so the same plant always returns the same
// guide instead of regenerating random text on every search.
function buildCareGuide(plant) {
  const category = CATEGORY_LABELS[plant.categoryKey] || 'a nursery plant'
  const sun = plant.sunlightText || 'bright, indirect sunlight for most of the day'
  const water = plant.waterText || 'moderate watering once the top inch of soil feels dry'
  const soil = plant.soilType || 'well-draining, nutrient-rich potting mix'
  const fert = plant.fertilizerInfo || 'a balanced, diluted liquid fertilizer during the growing season'

  return {
    watering: `${plant.name} needs ${water}. Always check the soil with your finger before watering - overwatering is the most common cause of problems in ${category} like this one.`,
    sunlight: `Place ${plant.name} where it gets ${sun}. Rotate the pot every couple of weeks for even growth.`,
    fertilizer: `Feed ${plant.name} with ${fert}, roughly once every 3-4 weeks in spring and summer. Stop or reduce feeding in winter.`,
    pruning: `Trim off yellow, dry or damaged leaves regularly with clean scissors to keep ${plant.name} healthy and encourage new growth.`,
    pest: `Check the underside of ${plant.name}'s leaves weekly for mealybugs, aphids or spider mites. Wipe leaves with a damp cloth and use neem oil spray if pests appear.`,
    season: `Reduce watering for ${plant.name} in cooler months, and resume regular feeding as new growth appears in spring. Soil: ${soil}.`,
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}


// searchCareGuide - GET /api/care/search?name=mango. Same case-insensitive
// exact-then-partial match behaviour as Plant Health search, so "mango",
// "Mango" and "MANGO" all resolve to the same plant (section 5 of spec).
const searchCareGuide = asyncHandler(async (req, res) => {
  const name = (req.query.name || '').trim()
  if (!name) {
    res.status(400)
    throw new Error('Provide a plant name to search for.')
  }
  const safe = escapeRegex(name)
  let plant = await Plant.findOne({ name: new RegExp(`^${safe}$`, 'i') })
  if (!plant) plant = await Plant.findOne({ name: new RegExp(safe, 'i') })

  if (!plant) {
    res.status(404)
    throw new Error(`No plant found matching "${name}".`)
  }

  const hasGuide = plant.care && Object.values(plant.care.toObject ? plant.care.toObject() : plant.care).some(Boolean)
  if (!hasGuide) {
    plant.care = buildCareGuide(plant)
    await plant.save()
  }

  res.json({ success: true, plant })
})

module.exports = { searchCareGuide, buildCareGuide }
