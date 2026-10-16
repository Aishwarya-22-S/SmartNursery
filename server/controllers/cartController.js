const asyncHandler = require('../middleware/asyncHandler')
const Cart = require('../models/Cart')

// formatCart - shapes the response to match the frontend's existing flat
// `cart` array (each item needs an `id` the UI already keys/updates by).
function formatCart(cartDoc) {
  const items = cartDoc ? cartDoc.items : []
  return items.map((item) => ({
    id: item.plant ? String(item.plant) : item.name,
    name: item.name,
    price: item.price,
    image: item.image,
    qty: item.qty,
  }))
}

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId })
  if (!cart) cart = await Cart.create({ user: userId, items: [] })
  return cart
}

const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id)
  res.json({ success: true, cart: formatCart(cart) })
})

// addToCart - mirrors AppContext.addToCart(): if the plant is already in
// the cart, increase its quantity instead of adding a duplicate row.
const addToCart = asyncHandler(async (req, res) => {
  const { id, name, price, image, imageUrl, size = 'medium', qty } = req.body
  if (!name || price === undefined) {
    res.status(400)
    throw new Error('Cart item needs a name and price.')
  }
  const cart = await getOrCreateCart(req.user._id)
  const existing = cart.items.find((item) => String(item.plant) === String(id) && item.size === size)
  if (existing) {
    existing.qty += qty || 1
  } else {
    cart.items.push({ plant: id || undefined, name, price, image, imageUrl, size, qty: qty || 1 })
  }
  await cart.save()
  res.status(201).json({ success: true, cart: formatCart(cart) })
})

const updateCartItem = asyncHandler(async (req, res) => {
  const { qty } = req.body
  const cart = await getOrCreateCart(req.user._id)
  const item = cart.items.find((i) => String(i.plant) === String(req.params.itemId))
  if (!item) {
    res.status(404)
    throw new Error('Item not found in cart.')
  }
  item.qty = Math.max(1, Number(qty) || 1)
  await cart.save()
  res.json({ success: true, cart: formatCart(cart) })
})

const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id)
  cart.items = cart.items.filter((i) => String(i.plant) !== String(req.params.itemId))
  await cart.save()
  res.json({ success: true, cart: formatCart(cart) })
})

const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id)
  cart.items = []
  await cart.save()
  res.json({ success: true, cart: [] })
})

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart, getOrCreateCart, formatCart }
