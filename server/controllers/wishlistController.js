const asyncHandler = require('../middleware/asyncHandler')
const Wishlist = require('../models/Wishlist')

function formatWishlist(doc) {
  const items = doc ? doc.items : []
  return items.map((item) => ({
    id: item.plant ? String(item.plant) : item.name,
    name: item.name,
    price: item.price,
    image: item.image,
  }))
}

async function getOrCreateWishlist(userId) {
  let wishlist = await Wishlist.findOne({ user: userId })
  if (!wishlist) wishlist = await Wishlist.create({ user: userId, items: [] })
  return wishlist
}

// getWishlist - always scoped to req.user, so Customer A can never fetch
// Customer B's wishlist by any means (no other lookup path exists).
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id)
  res.json({ success: true, wishlist: formatWishlist(wishlist) })
})

const addToWishlist = asyncHandler(async (req, res) => {
  const { id, name, price, image } = req.body
  if (!name || price === undefined) {
    res.status(400)
    throw new Error('Wishlist item needs a name and price.')
  }
  const wishlist = await getOrCreateWishlist(req.user._id)
  const exists = wishlist.items.find((item) => String(item.plant) === String(id))
  if (!exists) {
    wishlist.items.push({ plant: id || undefined, name, price, image })
    await wishlist.save()
  }
  res.status(201).json({ success: true, wishlist: formatWishlist(wishlist) })
})

const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id)
  wishlist.items = wishlist.items.filter((item) => String(item.plant) !== String(req.params.plantId))
  await wishlist.save()
  res.json({ success: true, wishlist: formatWishlist(wishlist) })
})

module.exports = { getWishlist, addToWishlist, removeFromWishlist }
