// seedData.js - populates MongoDB with the same demo accounts and catalog
// the original frontend had hard-coded, so the app isn't empty on first
// run. Run with: npm run seed  (from /server)
// Destroy with:  npm run seed:destroy
require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('../config/db')

const User = require('../models/User')
const Plant = require('../models/Plant')
const Settings = require('../models/Settings')
const Notification = require('../models/Notification')
const Order = require('../models/Order')
const Payment = require('../models/Payment')
const Cart = require('../models/Cart')
const Wishlist = require('../models/Wishlist')
const PlantHealth = require('../models/PlantHealth')
const Detection = require('../models/Detection')

const users = [
  { name: 'GreenLeaf Admin', email: 'admin@greenleaf.com', password: '123456', role: 'admin', phone: '+91 98765 43210' },
  { name: 'Ravi Kumar', email: 'staff1@greenleaf.com', password: '123456', role: 'staff', phone: '+91 91234 56780' },
  { name: 'Priya Menon', email: 'staff2@greenleaf.com', password: '123456', role: 'staff', phone: '+91 91234 56781' },
  { name: 'Arjun Nair', email: 'staff3@greenleaf.com', password: '123456', role: 'staff', phone: '+91 91234 56782' },
  { name: 'Aishwarya S.', email: 'customer@greenleaf.com', password: '123456', role: 'customer', phone: '+91 90000 11122' },
]

// ---- Realistic per-category defaults (section 1.B / 4 of the spec) ----
// Used by p() below to fill in sunlight/water/soil/fertilizer text for
// every plant so nothing in the catalogue is left blank, while still
// letting any individual plant override a field with something more
// specific (e.g. Mango's fruiting fertilizer schedule).
const CATEGORY_DEFAULTS = {
  catIndoor: {
    sunlightText: 'Bright, indirect light near a window; avoid harsh direct sun',
    waterText: 'Water when the top inch of soil feels dry, roughly once a week',
    soilType: 'Well-draining potting mix with added perlite',
    fertilizerInfo: 'Balanced liquid fertilizer every 4 weeks during spring and summer',
  },
  catOutdoor: {
    sunlightText: 'Full sun to partial shade, at least 4-5 hours of light daily',
    waterText: 'Regular watering 2-3 times a week, more often in peak summer',
    soilType: 'Garden loam mixed with organic compost',
    fertilizerInfo: 'Slow-release granular fertilizer every 6-8 weeks',
  },
  catSucculents: {
    sunlightText: 'Bright direct to indirect sunlight for several hours a day',
    waterText: 'Deep but infrequent watering; let soil dry out completely between waterings',
    soilType: 'Fast-draining cactus/succulent mix with coarse sand',
    fertilizerInfo: 'Diluted cactus fertilizer once a month, only in the growing season',
  },
  catFlowering: {
    sunlightText: 'Full sun for at least 5-6 hours a day for best blooming',
    waterText: 'Water 3-4 times a week, keeping soil consistently moist but not soggy',
    soilType: 'Rich, well-draining loamy soil',
    fertilizerInfo: 'Phosphorus-rich bloom-booster fertilizer every 3-4 weeks',
  },
  catFruit: {
    sunlightText: 'Full sun, a minimum of 6 hours of direct light daily',
    waterText: 'Deep watering twice a week, increased during flowering and fruiting',
    soilType: 'Fertile, well-draining soil enriched with organic compost',
    fertilizerInfo: 'NPK fruiting fertilizer every 6 weeks through the growing season',
  },
  catAir: {
    sunlightText: 'Low to bright indirect light - tolerant of average indoor lighting',
    waterText: 'Water when the topsoil feels dry, about once a week',
    soilType: 'Light, airy, well-draining potting mix',
    fertilizerInfo: 'Light balanced liquid fertilizer once a month',
  },
}

let seq = 0
// buildCare - same generation approach as server/controllers/careController's
// buildCareGuide(), computed here at seed time so every plant in the
// catalogue ships with real, plant-specific text from the very first run
// instead of relying on lazy generation later.
const CATEGORY_LABELS = {
  catIndoor: 'an indoor plant', catOutdoor: 'an outdoor plant', catSucculents: 'a succulent',
  catFlowering: 'a flowering plant', catFruit: 'a fruit plant', catAir: 'an air-purifying plant',
}
function buildCare(name, categoryKey, sunlightText, waterText, soilType, fertilizerInfo) {
  const category = CATEGORY_LABELS[categoryKey] || 'a nursery plant'
  return {
    watering: `${name} needs ${waterText}. Always check the soil with your finger before watering - overwatering is the most common cause of problems in ${category} like this one.`,
    sunlight: `Place ${name} where it gets ${sunlightText}. Rotate the pot every couple of weeks for even growth.`,
    fertilizer: `Feed ${name} with ${fertilizerInfo}, roughly once every 3-4 weeks in spring and summer. Stop or reduce feeding in winter.`,
    pruning: `Trim off yellow, dry or damaged leaves regularly with clean scissors to keep ${name} healthy and encourage new growth.`,
    pest: `Check the underside of ${name}'s leaves weekly for mealybugs, aphids or spider mites. Wipe leaves with a damp cloth and use neem oil spray if pests appear.`,
    season: `Reduce watering for ${name} in cooler months, and resume regular feeding as new growth appears in spring. Soil: ${soilType}.`,
  }
}

// p(name, categoryKey, price, emoji, qty, extra) - builds one full plant
// record, filling anything not explicitly passed in `extra` from the
// category defaults above so every plant has real, non-empty data for
// every field the spec asks for (section 1.B), plus a matching Care
// Guide (section 3.G).
function p(name, categoryKey, price, emoji, qty, extra = {}) {
  seq += 1
  const d = CATEGORY_DEFAULTS[categoryKey]
  const ratingPool = [4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9]
  const sunlightText = extra.sunlightText || d.sunlightText
  const waterText = extra.waterText || d.waterText
  const soilType = extra.soilType || d.soilType
  const fertilizerInfo = extra.fertilizerInfo || d.fertilizerInfo
  
  // Size-based pricing (Requirement 3.A)
  const smallPrice = Math.round(price * 0.7)
  const mediumPrice = price
  const largePrice = Math.round(price * 1.4)
  const basePurchasePrice = extra.purchasePrice || Math.round(price * 0.6)
  
  return {
    name,
    categoryKey,
    price,
    emoji,
    qty,
    tagKey: extra.tagKey || '',
    sunlightKey: 'sunLowIndirect',
    waterKey: 'waterFreq',
    careLevelKey: extra.careLevelKey || 'careEasy',
    height: extra.height || '25-45 cm',
    rating: extra.rating || ratingPool[seq % ratingPool.length],
    reviews: extra.reviews ?? (15 + ((seq * 37) % 260)),
    sunlightText,
    waterText,
    soilType,
    fertilizerInfo,
    description: extra.description || `${name} is a healthy, nursery-grown plant, well suited to ${categoryKey === 'catIndoor' ? 'indoor spaces' : categoryKey === 'catOutdoor' ? 'gardens and balconies' : categoryKey === 'catSucculents' ? 'low-maintenance indoor or outdoor display' : categoryKey === 'catFlowering' ? 'adding color to any garden' : categoryKey === 'catFruit' ? 'home fruit gardening' : 'improving indoor air quality'}.`,
    care: buildCare(name, categoryKey, sunlightText, waterText, soilType, fertilizerInfo),
    imageUrl: extra.imageUrl || '',
    // Size-based inventory (Requirement 3.A)
    sizes: {
      small: Math.floor(qty * 0.3),
      medium: Math.floor(qty * 0.5),
      large: Math.floor(qty * 0.2),
    },
    prices: {
      small: smallPrice,
      medium: mediumPrice,
      large: largePrice,
    },
    // Enhanced supplier information (Requirement 4)
    supplier: extra.supplier || 'GreenLeaf Nursery',
    supplierNursery: extra.supplierNursery || 'GreenLeaf Nursery & Garden Center',
    supplierEmail: extra.supplierEmail || 'supplies@greenleaf.com',
    purchasedFrom: extra.purchasedFrom || 'Madurai',
    supplierContact: extra.supplierContact || '+91-9876543210',
    supplierLocation: extra.supplierLocation || 'Madurai, Tamil Nadu',
    purchasePrice: basePurchasePrice,
    purchasePrices: {
      small: Math.round(basePurchasePrice * 0.7),
      medium: basePurchasePrice,
      large: Math.round(basePurchasePrice * 1.4),
    },
    purchaseQuantity: extra.purchaseQuantity || qty,
    purchaseDate: extra.purchaseDate || new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    lastRestockedDate: extra.lastRestockedDate || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    location: extra.location || 'Nursery Section A',
  }
}

const plants = [
  // ---------------- Indoor Plants ----------------
  p('Snake Plant', 'catIndoor', 300, '🪴', 34, { tagKey: 'tagPopular', careLevelKey: 'careEasy', height: '40-60 cm', imageUrl: 'https://images.unsplash.com/photo-1598499810694-b5f0899c37e3?w=400&h=400&fit=crop', careInfo: 'Extremely tolerant of neglect and low light.' }),
  p('Money Plant', 'catIndoor', 150, '🌱', 52, { tagKey: 'tagBestSeller', imageUrl: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&h=400&fit=crop', height: '20-40 cm' }),
  p('ZZ Plant', 'catIndoor', 320, '🌿', 20, { imageUrl: 'https://images.unsplash.com/photo-1612959637281-92a374fab563?w=400&h=400&fit=crop', height: '35-55 cm' }),
  p('Peace Lily', 'catIndoor', 250, '🌸', 30, { tagKey: 'tagBestSeller', imageUrl: 'https://images.unsplash.com/photo-1628525752277-3f99a7c6fb35?w=400&h=400&fit=crop', height: '30-45 cm' }),
  p('Spider Plant', 'catIndoor', 180, '🌿', 27, { imageUrl: 'https://images.unsplash.com/photo-1574359411659-7efcb19c164d?w=400&h=400&fit=crop', height: '25-40 cm' }),
  p('Areca Palm', 'catIndoor', 350, '🌴', 15, { tagKey: 'tagNew', imageUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd8952e7?w=400&h=400&fit=crop', height: '60-90 cm' }),
  p('Rubber Plant', 'catIndoor', 380, '🌳', 22, { tagKey: 'tagNew', imageUrl: 'https://images.unsplash.com/photo-1585074268335-ab76852908f3?w=400&h=400&fit=crop', height: '50-70 cm' }),
  p('Monstera', 'catIndoor', 450, '🌿', 12, { tagKey: 'tagPopular', imageUrl: 'https://images.unsplash.com/photo-1527715386754-4b100091cd2c?w=400&h=400&fit=crop', height: '40-70 cm' }),
  p('Lucky Bamboo', 'catIndoor', 200, '🎍', 0, { imageUrl: 'https://images.unsplash.com/photo-1598499810294-e1c59c0a96ba?w=400&h=400&fit=crop', height: '25-35 cm' }),
  p('Boston Fern', 'catIndoor', 220, '🌿', 18, { imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=400&fit=crop', waterText: 'Keep soil consistently moist; likes higher humidity', height: '30-45 cm' }),
  p('Calathea', 'catIndoor', 280, '🌿', 10, { imageUrl: 'https://images.unsplash.com/photo-1585484985843-1b270cf8797c?w=400&h=400&fit=crop', height: '25-40 cm' }),
  p('Dracaena', 'catIndoor', 310, '🌴', 16, { imageUrl: 'https://images.unsplash.com/photo-1584654894067-c3b1f3c15e3f?w=400&h=400&fit=crop', height: '45-70 cm' }),
  p('Philodendron', 'catIndoor', 260, '🌿', 24, { imageUrl: 'https://images.unsplash.com/photo-1578499810694-b5f0899c37e3?w=400&h=400&fit=crop', height: '30-50 cm' }),

  // ---------------- Succulents ----------------
  p('Aloe Vera', 'catSucculents', 120, '🌵', 45, { tagKey: 'tagPopular', imageUrl: 'https://images.unsplash.com/photo-1563241588-21d689dbb964?w=400&h=400&fit=crop', height: '20-30 cm', careInfo: 'Gel from the leaves is often used for skin care.' }),
  p('Jade Plant', 'catSucculents', 140, '🪴', 33, { imageUrl: 'https://images.unsplash.com/photo-1596848212624-953c6dda588d?w=400&h=400&fit=crop', height: '15-30 cm' }),
  p('Haworthia', 'catSucculents', 110, '🌵', 28, { imageUrl: 'https://images.unsplash.com/photo-1609437281649-ef17cdca6407?w=400&h=400&fit=crop', height: '8-12 cm' }),
  p('Echeveria', 'catSucculents', 130, '🌵', 25, { imageUrl: 'https://loremflickr.com/400/400/echeveria,plant?lock=97348', height: '8-15 cm' }),
  p('Zebra Cactus', 'catSucculents', 115, '🌵', 19, { imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop', height: '10-15 cm' }),
  p('Barrel Cactus', 'catSucculents', 190, '🌵', 14, { imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop', height: '15-25 cm' }),

  // ---------------- Outdoor Plants ----------------
  p('Croton', 'catOutdoor', 170, '🍁', 26, { imageUrl: 'https://images.unsplash.com/photo-1611576425814-969e9f7fc5cb?w=400&h=400&fit=crop', height: '40-60 cm' }),
  p('Bougainvillea', 'catOutdoor', 160, '🌺', 18, { tagKey: 'tagNew', imageUrl: 'https://images.unsplash.com/photo-1599599810694-b5f0899c37e3?w=400&h=400&fit=crop', height: '30-50 cm' }),
  p('Ixora', 'catOutdoor', 140, '🌺', 21, { imageUrl: 'https://images.unsplash.com/photo-1490841896149-c8620f4d566d?w=400&h=400&fit=crop', height: '30-45 cm' }),
  p('Gardenia', 'catOutdoor', 210, '🌼', 9, { imageUrl: 'https://images.unsplash.com/photo-1549927194-39f1f109be5f?w=400&h=400&fit=crop', height: '30-50 cm' }),
  p('Plumeria', 'catOutdoor', 230, '🌸', 11, { imageUrl: 'https://images.unsplash.com/photo-1599599810964-b70eca2b0b0e?w=400&h=400&fit=crop', height: '50-80 cm' }),
  p('Lavender', 'catOutdoor', 190, '💜', 17, { imageUrl: 'https://images.unsplash.com/photo-1587598069806-8c2c5ac2ecb7?w=400&h=400&fit=crop', height: '25-40 cm' }),
  p('Curry Leaf Plant', 'catOutdoor', 130, '🌿', 40, { imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b2c399f?w=400&h=400&fit=crop', height: '30-60 cm' }),
  p('Tulsi Plant', 'catOutdoor', 90, '🍃', 60, { tagKey: 'tagPopular', imageUrl: 'https://images.unsplash.com/photo-1530707226157-66f0dd5d9e11?w=400&h=400&fit=crop', height: '20-30 cm' }),

  // ---------------- Flowering Plants ----------------
  p('Rose', 'catFlowering', 180, '🌹', 38, { tagKey: 'tagBestSeller', imageUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=400&fit=crop', height: '30-60 cm' }),
  p('Hibiscus', 'catFlowering', 150, '🌺', 29, { imageUrl: 'https://images.unsplash.com/photo-1595607772223-effbbe2e8db0?w=400&h=400&fit=crop', height: '40-70 cm' }),
  p('Jasmine', 'catFlowering', 160, '🌼', 24, { imageUrl: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400&h=400&fit=crop', waterText: 'Water 3-4 times a week; fragrant blooms appear at night', height: '30-50 cm' }),
  p('Marigold', 'catFlowering', 60, '🌼', 70, { tagKey: 'tagPopular', imageUrl: 'https://images.unsplash.com/photo-1566456895541-a05e5e75b72c?w=400&h=400&fit=crop', height: '15-30 cm' }),
  p('Chrysanthemum', 'catFlowering', 140, '🌼', 22, { imageUrl: 'https://images.unsplash.com/photo-1583822261290-991b38693d1b?w=400&h=400&fit=crop', height: '25-40 cm' }),
  p('Dahlia', 'catFlowering', 170, '🌸', 16, { imageUrl: 'https://images.unsplash.com/photo-1540763185298-1b434c919eba?w=400&h=400&fit=crop', height: '30-60 cm' }),
  p('Sunflower', 'catFlowering', 80, '🌻', 34, { imageUrl: 'https://images.unsplash.com/photo-1597848628488-5104cc3de4b2?w=400&h=400&fit=crop', sunlightText: 'Needs full, direct sun for at least 6-8 hours', height: '60-120 cm' }),
  p('Petunia', 'catFlowering', 90, '🌸', 31, { imageUrl: 'https://images.unsplash.com/photo-1490312278390-ab64016176a7?w=400&h=400&fit=crop', height: '15-25 cm' }),
  p('Geranium', 'catFlowering', 120, '🌸', 20, { imageUrl: 'https://loremflickr.com/400/400/geranium,plant?lock=31481', height: '25-40 cm' }),
  p('Lotus', 'catFlowering', 250, '🪷', 6, { imageUrl: 'https://loremflickr.com/400/400/lotus,plant?lock=29372', waterText: 'Grows rooted in a water container/pond; keep submerged in a few inches of water', soilType: 'Heavy aquatic clay loam kept underwater', height: '20-40 cm (floating)' }),

  // ---------------- Fruit Plants ----------------
  p('Mango', 'catFruit', 450, '🥭', 12, { tagKey: 'tagBestSeller', imageUrl: 'https://images.unsplash.com/photo-1585864299869-592a1dff6f7f?w=400&h=400&fit=crop', height: '1-2 m (sapling)', fertilizerInfo: 'NPK fruiting fertilizer every 6-8 weeks; extra potassium during flowering' }),
  p('Guava', 'catFruit', 350, '🍈', 15, { imageUrl: 'https://loremflickr.com/400/400/guava,plant?lock=94857', height: '1-1.5 m (sapling)' }),
  p('Lemon', 'catFruit', 300, '🍋', 20, { imageUrl: 'https://images.unsplash.com/photo-1557801132-ec3edf387b47?w=400&h=400&fit=crop', height: '1-1.5 m (sapling)' }),
  p('Orange', 'catFruit', 320, '🍊', 14, { imageUrl: 'https://loremflickr.com/400/400/orange,plant?lock=52538', height: '1-1.5 m (sapling)' }),
  p('Pomegranate', 'catFruit', 380, '🌰', 10, { imageUrl: 'https://loremflickr.com/400/400/pomegranate,plant?lock=20430', height: '1-2 m (sapling)' }),
  p('Papaya', 'catFruit', 250, '🌴', 18, { imageUrl: 'https://loremflickr.com/400/400/papaya,plant?lock=85678', height: '1-1.5 m (sapling)' }),
  p('Banana', 'catFruit', 220, '🍌', 16, { imageUrl: 'https://loremflickr.com/400/400/banana,plant?lock=51771', waterText: 'Needs frequent watering; keep soil consistently moist', height: '1.5-2 m (sapling)' }),
  p('Sapota', 'catFruit', 360, '🟤', 9, { imageUrl: 'https://loremflickr.com/400/400/sapota,plant?lock=91762', height: '1-2 m (sapling)' }),
  p('Custard Apple', 'catFruit', 340, '🍏', 11, { imageUrl: 'https://loremflickr.com/400/400/custard-apple,plant?lock=29335', height: '1-1.5 m (sapling)' }),
  p('Fig', 'catFruit', 400, '🫐', 8, { imageUrl: 'https://loremflickr.com/400/400/fig,plant?lock=64059', height: '1-1.5 m (sapling)' }),
  p('Dragon Fruit', 'catFruit', 420, '🐉', 7, { tagKey: 'tagNew', imageUrl: 'https://loremflickr.com/400/400/dragon-fruit,plant?lock=97123', sunlightText: 'Full sun; a climbing cactus that fruits best with strong light', soilType: 'Fast-draining sandy/cactus mix', height: '60-100 cm (on stake)' }),
  p('Grapefruit', 'catFruit', 330, '🍊', 6, { imageUrl: 'https://loremflickr.com/400/400/grapefruit,plant?lock=62096', height: '1-1.5 m (sapling)' }),

  // ---------------- Air-Purifying Plants ----------------
  p('Bamboo Palm', 'catAir', 340, '🌴', 13, { imageUrl: 'https://loremflickr.com/400/400/bamboo-palm,plant?lock=21675', height: '60-100 cm' }),
  p('English Ivy', 'catAir', 160, '🌿', 20, { imageUrl: 'https://loremflickr.com/400/400/english-ivy,plant?lock=64384', height: 'trailing, 20-40 cm pot' }),
  p('Golden Pothos', 'catAir', 150, '🌿', 36, { tagKey: 'tagPopular', imageUrl: 'https://loremflickr.com/400/400/golden-pothos,plant?lock=33504', height: 'trailing, 20-40 cm pot' }),
  p('Weeping Fig', 'catAir', 370, '🌳', 9, { imageUrl: 'https://loremflickr.com/400/400/weeping-fig,plant?lock=8060', height: '60-100 cm' }),
  p('Chinese Evergreen', 'catAir', 260, '🌿', 17, { imageUrl: 'https://loremflickr.com/400/400/chinese-evergreen,plant?lock=88051', height: '30-45 cm' }),
]


async function seed() {
  await connectDB()

  await Promise.all([
    User.deleteMany({}),
    Plant.deleteMany({}),
    Settings.deleteMany({}),
    Notification.deleteMany({}),
    Order.deleteMany({}),
    Payment.deleteMany({}),
    Cart.deleteMany({}),
    Wishlist.deleteMany({}),
    PlantHealth.deleteMany({}),
    Detection.deleteMany({}),
  ])

  const createdUsers = []
  for (const u of users) {
    const user = await User.create(u)
    await Settings.create({ user: user._id })
    await Cart.create({ user: user._id, items: [] })
    await Wishlist.create({ user: user._id, items: [] })
    createdUsers.push(user)
  }
  const customer = createdUsers.find((u) => u.role === 'customer')

  const createdPlants = await Plant.insertMany(plants)
  const aloe = createdPlants.find((p) => p.name === 'Aloe Vera')
  const lily = createdPlants.find((p) => p.name === 'Peace Lily')

  // A seeded demo order so Order History / Payment Verification / Order
  // Tracking aren't empty on first login, same as the original frontend.
  const order = await Order.create({
    orderNumber: 'ORD-1025',
    user: customer._id,
    customerEmail: customer.email,
    customerName: customer.name,
    items: [
      { plant: aloe._id, name: 'Aloe Vera', qty: 1, price: 120 },
      { plant: lily._id, name: 'Peace Lily', qty: 1, price: 250 },
    ],
    totalAmount: 410,
    paymentMethod: 'UPI',
    paymentStatus: 'Verified',
    orderStatus: 'stageTransit',
  })
  await Payment.create({
    order: order._id,
    orderNumber: order.orderNumber,
    user: customer._id,
    amount: 410,
    paymentMethod: 'UPI',
    status: 'verified',
    verifiedAt: new Date(),
  })

  await Notification.create([
    { icon: '💧', titleKey: 'notifWateringTitle', msgKey: 'notifWateringMsg', group: 'Reminders', roles: ['customer'] },
    { icon: '📦', titleKey: 'notifOrderTitle', msgKey: 'notifOrderMsg', group: 'Orders', roles: ['customer'] },
    { icon: '🩺', titleKey: 'notifAiTitle', msgKey: 'notifAiMsg', group: 'Alerts', roles: ['customer'], read: true },
    { icon: '🎁', titleKey: 'notifOfferTitle', msgKey: 'notifOfferMsg', group: 'Offers', roles: ['customer'], read: true },
    { icon: '⚙️', titleKey: 'notifSystemTitle', msgKey: 'notifSystemMsg', group: 'Alerts', roles: ['staff'], read: true },
  ])

  console.log('Seed complete:')
  console.log('  Admin:    admin@greenleaf.com / 123456')
  console.log('  Staff:    staff1@greenleaf.com / 123456 (also staff2/staff3@greenleaf.com)')
  console.log('  Customer: customer@greenleaf.com / 123456')

  await mongoose.disconnect()
  process.exit(0)
}

async function destroy() {
  await connectDB()
  await Promise.all([
    User.deleteMany({}),
    Plant.deleteMany({}),
    Settings.deleteMany({}),
    Notification.deleteMany({}),
    Order.deleteMany({}),
    Payment.deleteMany({}),
    Cart.deleteMany({}),
    Wishlist.deleteMany({}),
    PlantHealth.deleteMany({}),
    Detection.deleteMany({}),
  ])
  console.log('All data destroyed.')
  await mongoose.disconnect()
  process.exit(0)
}

if (process.argv.includes('--destroy')) {
  destroy()
} else {
  seed()
}
