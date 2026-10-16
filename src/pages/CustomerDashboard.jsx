import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import { api } from '../services/api.js'
import { getPlantImage } from '../utils/plantImages.js'

function CustomerDashboard() {
  const { user, cart, wishlist, orders, t } = useContext(AppContext)
  const [recommendedPlants, setRecommendedPlants] = useState([])

  useEffect(() => {
    let cancelled = false
    api.get('/plants')
      .then((res) => {
        if (cancelled) return
        setRecommendedPlants((res.plants || []).slice(0, 4).map((plant) => ({
          ...plant,
          imageUrl: getPlantImage(plant),
        })))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const myOrders = orders.filter((order) => order.customerEmail === user.email)

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="dash-title">{t('customerWelcome')} {user.name.split(' ')[0]}! 🌿</div>
        <div className="dash-subtitle">{t('customerSubtitle')}</div>
      </div>

      <div className="grid grid-3 mb-24">
        <Link to="/order-history" className="card stat-card">
          <div className="stat-icon">📦</div>
          <div><div className="stat-value">{myOrders.length}</div><div className="stat-label">{t('statMyOrders')}</div></div>
        </Link>
        <Link to="/wishlist" className="card stat-card">
          <div className="stat-icon">💝</div>
          <div><div className="stat-value">{wishlist.length}</div><div className="stat-label">{t('statWishlist')}</div></div>
        </Link>
        <div className="card stat-card">
          <div className="stat-icon">🏆</div>
          <div><div className="stat-value">{user.rewardPoints}</div><div className="stat-label">{t('statRewards')}</div></div>
        </div>
      </div>

      <div className="section-title">
        {t('recommendedForYou')}
        <Link to="/plants" className="view-all">{t('viewAll')}</Link>
      </div>
      <div className="grid grid-4 mb-24">
        {recommendedPlants.map((plant) => (
          <Link key={plant._id} to={`/plants/${plant._id}`} className="plant-card">
            <div className="plant-thumb">
              {plant.imageUrl ? (
                <img src={plant.imageUrl} alt={plant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(event) => { event.currentTarget.style.display = 'none' }} />
              ) : <span>{plant.emoji || '🌿'}</span>}
            </div>
            <div className="plant-info">
              <div className="plant-name">{plant.name}</div>
              <div className="plant-price">₹{plant.prices?.medium ?? plant.price}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="section-title">{t('cartSummary')}</div>
        {cart.map((item) => (
          <div key={item.id} className="flex-between" style={{ padding: '8px 0' }}>
            <span>{item.image} {item.name} × {item.qty}</span>
            <span style={{ fontWeight: 600 }}>₹{item.price * item.qty}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CustomerDashboard
