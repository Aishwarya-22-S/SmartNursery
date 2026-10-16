const mongoose = require('mongoose')

// Plant - a single source of truth for the plant catalog AND the
// inventory/stock numbers. The frontend's PlantCatalog, PlantDetails and
// Inventory pages all read/write the same underlying plant records (the
// original frontend just had two separate hard-coded arrays for the same
// plants), so this collection carries both the shop-facing fields and the
// operational qty/status used by Inventory.
const plantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    categoryKey: { type: String, required: true, default: 'catIndoor' },
    price: { type: Number, required: true, min: 0 },
    emoji: { type: String, default: '🌿' },
    imageUrl: { type: String, default: '' },
    tagKey: { type: String, default: '' },
    descriptionKey: { type: String, default: '' },
    description: { type: String, default: '' },
    sunlightKey: { type: String, default: 'sunLowIndirect' },
    waterKey: { type: String, default: 'waterFreq' },
    careLevelKey: { type: String, default: 'careEasy' },
    height: { type: String, default: '' },
    rating: { type: Number, default: 4.5 },
    reviews: { type: Number, default: 0 },
    qty: { type: Number, default: 0, min: 0 },

    // ---- Size-Based Pricing (Requirement 3.A) ----
    sizes: {
      small: { type: Number, default: 0, min: 0 },
      medium: { type: Number, default: 0, min: 0 },
      large: { type: Number, default: 0, min: 0 },
    },
    prices: {
      small: { type: Number, default: 0, min: 0 },
      medium: { type: Number, default: 0, min: 0 },
      large: { type: Number, default: 0, min: 0 },
    },

    // ---- Realistic per-plant data (section 1.B of the spec) ----
    // Free-text fields so every plant can carry its own genuinely
    // different sunlight/water/soil/fertilizer/care info, instead of all
    // plants sharing the same handful of translation-key phrases above
    // (those keys are kept only for backward-compatible Tamil display).
    sunlightText: { type: String, default: '' },
    waterText: { type: String, default: '' },
    soilType: { type: String, default: '' },
    fertilizerInfo: { type: String, default: '' },
    careInfo: { type: String, default: '' },
    availability: { type: String, enum: ['Available', 'Limited', 'Unavailable'], default: 'Available' },

    // ---- Inventory Management fields (section 1.2 of the spec) ----
    supplier: { type: String, default: '' },
    supplierNursery: { type: String, default: '' },
    supplierEmail: { type: String, default: '' },
    purchasedFrom: { type: String, default: '' },
    supplierContact: { type: String, default: '' },
    purchasePrice: { type: Number, default: 0, min: 0 },
    purchasePrices: {
      small: { type: Number, min: 0 },
      medium: { type: Number, min: 0 },
      large: { type: Number, min: 0 },
    },
    purchaseDate: { type: Date, default: Date.now },
    lastRestockedDate: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
    location: { type: String, default: '' },
    supplierLocation: { type: String, default: '' },
    purchaseQuantity: { type: Number, default: 0, min: 0 },

    // ---- Plant Care Guide content (section 3.G of the spec) ----
    // Field names match exactly what PlantCareGuide.jsx's tab keys read
    // (watering/sunlight/fertilizer/pruning/pest/season). Populated per
    // plant in seed data where given; for any plant without one,
    // careController generates and persists a sensible, name-specific
    // guide on first lookup (see buildCareGuide()).
    care: {
      watering: { type: String, default: '' },
      sunlight: { type: String, default: '' },
      fertilizer: { type: String, default: '' },
      pruning: { type: String, default: '' },
      pest: { type: String, default: '' },
      season: { type: String, default: '' },
    },
  },
  { timestamps: true }
)

// statusKey - derived from qty, mirrors the thresholds the original
// frontend Inventory.jsx used (0 = out of stock, <20 = low stock).
plantSchema.virtual('statusKey').get(function computeStatusKey() {
  if (this.qty === 0) return 'statusOutOfStock'
  if (this.qty < 20) return 'statusLowStock'
  return 'statusInStock'
})

plantSchema.set('toJSON', { virtuals: true })
plantSchema.set('toObject', { virtuals: true })

module.exports = mongoose.model('Plant', plantSchema)
