import { useState, useCallback, useContext, useRef, useEffect } from 'react'
import PlantCard from '../components/PlantCard.jsx'
import PlantFormModal from '../components/PlantFormModal.jsx'
import { AppContext } from '../context/AppContext.jsx'
import { api } from '../services/api.js'
import { getPlantImage } from '../utils/plantImages.js'

const categoryKeys = ['catAll', 'catIndoor', 'catOutdoor', 'catSucculents', 'catFlowering', 'catFruit', 'catAir']

// PlantCatalog - shared "Plant Category" page for all three roles
// (section 1.B / 3.A of the spec). What a person can DO here changes by
// role, even though the catalogue data is identical:
//   - customer: Add to Cart + Wishlist heart on every card.
//   - admin: no cart/wishlist at all - instead Add/Edit/Delete, so this
//     page also serves as the plant-management view.
//   - staff: view-only (search/filter/details), no shopping or admin
//     actions.
function PlantCatalog() {
  const { addToCart, wishlist, toggleWishlist, user, notify, t } = useContext(AppContext)
  const role = user?.role || 'customer'

  const [allPlants, setAllPlants] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [categoryKey, setCategoryKey] = useState('catAll')

  const searchInputRef = useRef(null)

  // Admin add/edit modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPlant, setEditingPlant] = useState(null)

  const loadPlants = useCallback(async () => {
    try {
      const res = await api.get('/plants')
      setAllPlants(res.plants.map((p) => ({ ...p, id: p._id, imageUrl: getPlantImage(p) })))
    } catch (err) {
      console.error('Failed to load plants:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPlants()
  }, [loadPlants])

  const handleSearch = useCallback((e) => {
    setSearch(e.target.value)
  }, [])

  const handleAddToCart = useCallback((plant, size = 'medium') => {
    addToCart({ id: plant.id, name: plant.name, price: plant.prices?.[size] ?? plant.price, image: plant.emoji, imageUrl: plant.imageUrl, size })
  }, [addToCart])

  const handleToggleWishlist = useCallback((plant) => {
    toggleWishlist({ id: plant.id, name: plant.name, price: plant.prices?.medium ?? plant.price, image: plant.emoji, imageUrl: plant.imageUrl })
  }, [toggleWishlist])

  const openAdd = () => { setEditingPlant(null); setModalOpen(true) }
  const openEdit = (plant) => { setEditingPlant(plant); setModalOpen(true) }

  const handleSavePlant = async (formData) => {
    if (editingPlant) {
      await api.put(`/plants/${editingPlant.id}`, formData)
      notify('Plant updated successfully')
    } else {
      await api.post('/plants', formData)
      notify('Plant added successfully')
    }
    await loadPlants()
  }

  const handleDeletePlant = async (plant) => {
    const ok = window.confirm(`Delete "${plant.name}" from the catalogue? This cannot be undone.`)
    if (!ok) return
    try {
      await api.del(`/plants/${plant.id}`)
      setAllPlants((prev) => prev.filter((p) => p.id !== plant.id))
      notify('Plant deleted successfully')
    } catch (err) {
      notify(err.message || 'Could not delete this plant.', 'error')
    }
  }

  const filtered = allPlants.filter((p) => {
    const matchesCategory = categoryKey === 'catAll' || p.categoryKey === categoryKey
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const wishlistIds = new Set((wishlist || []).map((w) => w.id))

  return (
      <div className="page-content">
        <div className="flex-between mb-24" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="dash-title">{t('catalogTitle')}</div>
            <div className="dash-subtitle">{filtered.length} {t('catalogPlantsFound')}</div>
          </div>
          <div className="flex-gap" style={{ flexWrap: 'wrap' }}>
            <div className="search-bar" style={{ maxWidth: 340 }}>
              <span onClick={() => searchInputRef.current?.focus()}>🔍</span>
              <input ref={searchInputRef} placeholder={t('searchPlaceholderCatalog')} value={search} onChange={handleSearch} />
            </div>
          </div>
        </div>

        <div className="chip-row mb-24">
          {categoryKeys.map((ck) => (
            <button key={ck} className={`chip ${categoryKey === ck ? 'active' : ''}`} onClick={() => setCategoryKey(ck)}>
              {t(ck)}
            </button>
          ))}
        </div>

        <div className="grid grid-4">
          {filtered.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={{ ...plant, category: t(plant.categoryKey), tag: t(plant.tagKey) }}
              role={role}
              onAddToCart={role === 'customer' ? handleAddToCart : undefined}
              addToCartLabel={t('addToCart')}
              isWishlisted={wishlistIds.has(plant.id)}
              onToggleWishlist={role === 'customer' ? handleToggleWishlist : undefined}
              onEdit={undefined}
              onDelete={undefined}
            />
          ))}
        </div>
        {!loading && filtered.length === 0 && <p className="empty-state">{t('noPlantsMatch')}</p>}

        {modalOpen && (
          <PlantFormModal
            initial={editingPlant}
            onClose={() => setModalOpen(false)}
            onSave={handleSavePlant}
          />
        )}
    </div>
  )
}

export default PlantCatalog
