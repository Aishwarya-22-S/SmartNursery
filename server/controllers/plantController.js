const asyncHandler = require('../middleware/asyncHandler')
const Plant = require('../models/Plant')
const { buildCareGuide } = require('./careController')

// getPlants - supports optional ?search=name (case-insensitive, section 5
// of the spec) and ?category=catIndoor so both the public catalog and
// Admin Inventory/Plant Category search & filter can be server-driven.
const getPlants = asyncHandler(async (req, res) => {
  const filter = {}
  if (req.query.search) {
    filter.name = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
  }
  if (req.query.category && req.query.category !== 'catAll') {
    filter.categoryKey = req.query.category
  }
  const plants = await Plant.find(filter).sort({ name: 1 })
  res.json({ success: true, plants })
})

const getPlantById = asyncHandler(async (req, res) => {
  const plant = await Plant.findById(req.params.id)
  if (!plant) {
    res.status(404)
    throw new Error('Plant not found.')
  }
  const hasGuide = plant.care && Object.values(plant.care.toObject ? plant.care.toObject() : plant.care).some(Boolean)
  if (!hasGuide) {
    plant.care = buildCareGuide(plant)
    await plant.save()
  }
  res.json({ success: true, plant })
})

const createPlant = asyncHandler(async (req, res) => {
  const { name, price, qty } = req.body
  if (!name || price === undefined) {
    res.status(400)
    throw new Error('Plant name and price are required.')
  }
  if (price < 0 || (qty !== undefined && qty < 0)) {
    res.status(400)
    throw new Error('Price and quantity cannot be negative.')
  }
  const plant = await Plant.create(req.body)
  res.status(201).json({ success: true, plant })
})

const updatePlant = asyncHandler(async (req, res) => {
  const plant = await Plant.findById(req.params.id)
  if (!plant) {
    res.status(404)
    throw new Error('Plant not found.')
  }
  Object.assign(plant, req.body)
  await plant.save()
  res.json({ success: true, plant })
})

const deletePlant = asyncHandler(async (req, res) => {
  const plant = await Plant.findById(req.params.id)
  if (!plant) {
    res.status(404)
    throw new Error('Plant not found.')
  }
  await plant.deleteOne()
  res.json({ success: true, message: 'Plant deleted.' })
})

// restockPlant - mirrors the frontend Inventory.jsx "Edit" action, which
// added 10 units per click.
const restockPlant = asyncHandler(async (req, res) => {
  const plant = await Plant.findById(req.params.id)
  if (!plant) {
    res.status(404)
    throw new Error('Plant not found.')
  }
  const amount = Number.isFinite(req.body?.amount) ? req.body.amount : 10
  plant.qty += amount
  await plant.save()
  res.json({ success: true, plant })
})

module.exports = { getPlants, getPlantById, createPlant, updatePlant, deletePlant, restockPlant }
