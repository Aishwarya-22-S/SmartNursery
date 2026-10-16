const asyncHandler = require('../middleware/asyncHandler')
const Plant = require('../models/Plant')
const Notification = require('../models/Notification')

// Inventory is not a separate dataset from the plant catalog in this app -
// Inventory.jsx and PlantCatalog.jsx both list the same plants, just with
// different fields visible. These endpoints operate on the same Plant
// collection so stock always matches what the catalog shows.
//
// Stock status is derived from `qty` (the Plant schema has no separate
// statusKey field), so it always reflects the real, current number in
// MongoDB rather than a stale/disconnected label.
const LOW_STOCK_THRESHOLD = 10
function stockStatus(qty) {
  if (qty <= 0) return 'outOfStock'
  if (qty < LOW_STOCK_THRESHOLD) return 'lowStock'
  return 'inStock'
}

const getInventory = asyncHandler(async (req, res) => {
  const plants = await Plant.find().sort({ name: 1 })
  const inStock = plants.filter((p) => stockStatus(p.qty) === 'inStock').length
  const lowStock = plants.filter((p) => stockStatus(p.qty) === 'lowStock').length
  const outOfStock = plants.filter((p) => stockStatus(p.qty) === 'outOfStock').length
  res.json({
    success: true,
    items: plants,
    summary: { total: plants.length, inStock, lowStock, outOfStock },
  })
})

const createInventoryItem = asyncHandler(async (req, res) => {
  const { name, price = 0, qty = 0 } = req.body
  if (!name) {
    res.status(400)
    throw new Error('Plant name is required.')
  }
  const plant = await Plant.create({ ...req.body, price, qty })
  res.status(201).json({ success: true, item: plant })
})

const updateInventoryItem = asyncHandler(async (req, res) => {
  const plant = await Plant.findById(req.params.id)
  if (!plant) {
    res.status(404)
    throw new Error('Inventory item not found.')
  }
  if (req.body.qty !== undefined && req.body.qty < 0) {
    res.status(400)
    throw new Error('Quantity cannot be negative.')
  }
  Object.assign(plant, req.body)
  await plant.save()

  // Low-stock alert - section 2.D of the spec ("Low stock alert" among
  // Staff notification types). Fired at most once per drop below the
  // threshold by checking there isn't already an unread alert for it.
  if (stockStatus(plant.qty) !== 'inStock') {
    const existing = await Notification.findOne({
      group: 'Alerts',
      read: false,
      message: new RegExp(`^Stock alert: ${plant.name}`),
    })
    if (!existing) {
      await Notification.create({
        icon: '📉',
        title: 'Low Stock Alert',
        message: `Stock alert: ${plant.name} is ${plant.qty <= 0 ? 'out of stock' : 'running low'} (${plant.qty} left).`,
        roles: ['staff'],
        group: 'Alerts',
      })
    }
  }

  res.json({ success: true, item: plant })
})

const deleteInventoryItem = asyncHandler(async (req, res) => {
  const plant = await Plant.findById(req.params.id)
  if (!plant) {
    res.status(404)
    throw new Error('Inventory item not found.')
  }
  await plant.deleteOne()
  res.json({ success: true, message: 'Inventory item removed.' })
})

module.exports = { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem }
