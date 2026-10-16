import { memo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPlantImage } from '../utils/plantImages.js'

const sizeLabels = { small: 'Small', medium: 'Medium', large: 'Large' }

const PlantCard = memo(function PlantCard({ plant, onAddToCart, addToCartLabel = 'Add to Cart', role = 'customer', isWishlisted = false, onToggleWishlist, onEdit, onDelete }) {
  const [added, setAdded] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const [selectedSize, setSelectedSize] = useState('medium')
  useEffect(() => {
    if (!added) return undefined
    const timer = setTimeout(() => setAdded(false), 1800)
    return () => clearTimeout(timer)
  }, [added])

  const image = getPlantImage(plant)
  const selectedStock = plant.sizes?.[selectedSize] ?? plant.qty
  const outOfStock = selectedStock !== undefined && selectedStock <= 0
  const handleAdd = async () => {
    if (!onAddToCart || outOfStock) return
    await onAddToCart(plant, selectedSize)
    setAdded(true)
  }
  const handleWishlist = (event) => {
    event.preventDefault()
    event.stopPropagation()
    onToggleWishlist?.(plant)
  }

  if (role === 'customer') {
    return (
      <article className="plant-card customer-product-card">
        {onToggleWishlist && (
          <button
            type="button"
            className={`wishlist-heart ${isWishlisted ? 'active' : ''}`}
            aria-label={isWishlisted ? `Remove ${plant.name} from wishlist` : `Add ${plant.name} to wishlist`}
            aria-pressed={isWishlisted}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={handleWishlist}
          >{isWishlisted ? '♥' : '♡'}</button>
        )}
        <Link to={`/plants/${plant.id}`} className="customer-product-link" aria-label={`View ${plant.name}`}>
          <div className="plant-thumb">
            {image && !imageFailed ? <img src={image} alt={plant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImageFailed(true)} /> : <span>{plant.emoji || '🌿'}</span>}
          </div>
          <div className="plant-info"><div className="plant-name">{plant.name}</div></div>
        </Link>
        <div className="customer-card-actions">
          <div className="size-choice-row card-size-row" role="group" aria-label={`${plant.name} size`}>
            {Object.keys(sizeLabels).map((size) => (
              <button type="button" key={size} className={`size-choice compact ${selectedSize === size ? 'active' : ''}`} aria-pressed={selectedSize === size} onClick={() => { setSelectedSize(size); setAdded(false) }}>
                {sizeLabels[size]}
              </button>
            ))}
          </div>
          <button type="button" className={`btn btn-sm customer-card-add ${added ? 'btn-primary' : 'btn-outline'}`} disabled={outOfStock || !onAddToCart} onClick={handleAdd}>
            {outOfStock ? 'Out of Stock' : added ? '✓ Added to Cart' : addToCartLabel}
          </button>
        </div>
      </article>
    )
  }

  const prices = plant.prices || { small: Math.round(plant.price * 0.7), medium: plant.price, large: Math.round(plant.price * 1.4) }
  const selectedPrice = prices[selectedSize] ?? plant.price

  return (
    <div className="plant-card">
      <Link to={`/plants/${plant.id}`}><div className="plant-thumb">{image && !imageFailed ? <img src={image} alt={plant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImageFailed(true)} /> : plant.emoji}</div></Link>
      <div className="plant-info">
        <div className="plant-name">{plant.name}</div><div className="plant-meta">{plant.category}</div>
        {role !== 'admin' && <div className="flex-between"><span className="plant-price">₹{selectedPrice}</span>{plant.tag ? <span className="badge badge-success">{plant.tag}</span> : (outOfStock ? <span className="badge badge-danger">Out of Stock</span> : null)}</div>}
        {role === 'admin' && (onEdit || onDelete) && <div className="plant-actions flex-gap">{onEdit && <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => onEdit(plant)}>Edit</button>}{onDelete && <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => onDelete(plant)}>Delete</button>}</div>}
      </div>
    </div>
  )
})

export default PlantCard
