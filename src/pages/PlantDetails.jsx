import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import { api } from '../services/api.js'
import { getPlantImage } from '../utils/plantImages.js'

const sizes = ['small', 'medium', 'large']

function PlantDetails() {
  const { id } = useParams()
  const { addToCart, t } = useContext(AppContext)
  const [plant, setPlant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedSize, setSelectedSize] = useState('small')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    api.get(`/plants/${id}`)
      .then((res) => { if (!cancelled) setPlant(res.plant) })
      .catch(() => { if (!cancelled) setNotFound(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  if (loading) return <div className="page-content"><p className="text-muted">Loading...</p></div>
  if (notFound || !plant) return <div className="page-content"><p className="empty-state">{t('noPlantsMatch')}</p></div>

  const imageUrl = getPlantImage(plant)
  const selectedPrice = plant.prices?.[selectedSize] ?? plant.price
  const selectedStock = plant.sizes?.[selectedSize] ?? plant.qty
  const outOfStock = selectedStock <= 0

  const handleAddToCart = async () => {
    if (outOfStock) return
    await addToCart({
      id: plant._id,
      name: plant.name,
      price: selectedPrice,
      image: imageUrl || plant.emoji,
      imageUrl,
      size: selectedSize,
      qty: 1,
    })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="page-content plant-size-page">
      <section className="plant-size-panel card" aria-label={`${plant.name} size selection`}>
        <div className="plant-size-photo">
          {imageUrl ? <img src={imageUrl} alt={plant.name} onError={(event) => { event.currentTarget.style.display = 'none' }} /> : <span aria-hidden="true">{plant.emoji || '🌿'}</span>}
        </div>
        <div className="plant-size-content">
          <h1>{plant.name}</h1>
          <p className="plant-size-prompt">{t('choosePlantSize')}</p>
          <div className="plant-size-options" role="group" aria-label={t('choosePlantSize')}>
            {sizes.map((size) => (
              <button
                type="button"
                key={size}
                className={`size-choice ${selectedSize === size ? 'active' : ''}`}
                aria-pressed={selectedSize === size}
                onClick={() => { setSelectedSize(size); setAdded(false) }}
              >
                {t(size)}
              </button>
            ))}
          </div>
          <div className="plant-size-price" aria-live="polite">
            <span>{t(selectedSize)}</span>
            <strong>₹{selectedPrice}</strong>
          </div>
          <button className="btn btn-primary plant-size-add" disabled={outOfStock} onClick={handleAddToCart}>
            {outOfStock ? t('statusOutOfStock') : added ? t('addedToCart') : t('addToCart')}
          </button>
        </div>
      </section>
    </div>
  )
}

export default PlantDetails
