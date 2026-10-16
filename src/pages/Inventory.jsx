import { useState, useCallback, useContext, useEffect, useMemo } from 'react'
import DashboardCard from '../components/DashboardCard.jsx'
import PlantFormModal from '../components/PlantFormModal.jsx'
import { AppContext } from '../context/AppContext.jsx'
import { api } from '../services/api.js'
import { getPlantImage } from '../utils/plantImages.js'

const statusBadge = { statusInStock: 'badge-success', statusLowStock: 'badge-warning', statusOutOfStock: 'badge-danger' }
const categoryFilterOptions = [
  { key: 'all', label: 'All Categories' }, { key: 'catIndoor', label: 'Indoor Plants' }, { key: 'catOutdoor', label: 'Outdoor Plants' },
  { key: 'catSucculents', label: 'Succulents' }, { key: 'catFlowering', label: 'Flowering Plants' }, { key: 'catFruit', label: 'Fruit Plants' }, { key: 'catAir', label: 'Air-Purifying Plants' },
]
const sizeLabels = { small: 'Small', medium: 'Medium', large: 'Large' }

function Icon({ type }) {
  if (type === 'edit') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg>
  if (type === 'delete') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 15H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
}

function getVariantPurchasePrice(item, size) {
  const variantValue = item.purchasePrices?.[size]
  if (variantValue !== undefined && variantValue !== null && variantValue !== '') return Number(variantValue)
  const base = Number(item.purchasePrice || 0)
  if (size === 'small') return Math.round(base * 0.7)
  if (size === 'large') return Math.round(base * 1.4)
  return base
}

function InventoryDetails({ item, onClose }) {
  const [selectedSize, setSelectedSize] = useState('medium')
  const prices = item.prices || { small: Math.round(item.price * 0.7), medium: item.price, large: Math.round(item.price * 1.4) }
  const image = getPlantImage(item)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(event) => event.stopPropagation()} style={{ maxWidth: 720 }}>
        <div className="flex-between mb-16"><div><h3 style={{ margin: 0 }}>{item.name}</h3><div className="text-muted">{item.categoryKey}</div></div><button className="icon-action" onClick={onClose} aria-label="Close details">×</button></div>
        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          <div className="plant-thumb" style={{ minHeight: 240, borderRadius: 10, overflow: 'hidden' }}>{image ? <img src={image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 100 }}>{item.emoji || '🌿'}</span>}</div>
          <div>
            <div className="text-muted" style={{ fontSize: 12 }}>SELECT SIZE</div>
            <div className="flex-gap mb-16" style={{ marginTop: 10 }}>{Object.keys(sizeLabels).map((size) => <button key={size} className={`chip ${selectedSize === size ? 'active' : ''}`} aria-pressed={selectedSize === size} onClick={() => setSelectedSize(size)}>{sizeLabels[size]}</button>)}</div>
            <div className="card" style={{ padding: 18, textAlign: 'center' }}><div className="text-muted">{sizeLabels[selectedSize]} selling price</div><div style={{ fontSize: 32, fontWeight: 700, color: 'var(--primary-dark)' }}>₹{prices[selectedSize] ?? item.price}</div><div className="text-muted" style={{ marginTop: 12 }}>{sizeLabels[selectedSize]} purchase price</div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>₹{getVariantPurchasePrice(item, selectedSize)}</div></div>
          </div>
        </div>
        <div className="card" style={{ padding: 14, marginTop: 16 }}>
          <div className="section-title" style={{ marginBottom: 10 }}>Supplier & purchase details</div>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <div><div className="text-muted">Supplier</div><strong>{item.supplier || '—'}</strong></div><div><div className="text-muted">Nursery / Vendor</div><strong>{item.supplierNursery || item.purchasedFrom || '—'}</strong></div>
            <div><div className="text-muted">Contact</div><strong>{item.supplierContact || item.supplierEmail || '—'}</strong></div><div><div className="text-muted">Purchase location</div><strong>{item.supplierLocation || item.purchasedFrom || '—'}</strong></div>
            <div><div className="text-muted">Storage</div><strong>{item.location || '—'}</strong></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Inventory() {
  const { t } = useContext(AppContext)
  const [stock, setStock] = useState([])
  const [summary, setSummary] = useState({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 })
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [detailsItem, setDetailsItem] = useState(null)

  const showToast = (message) => { setToast(message); setTimeout(() => setToast(''), 2500) }
  const loadInventory = useCallback(async () => {
    try {
      const response = await api.get('/inventory')
      setStock(response.items)
      setSummary(response.summary)
    } catch (err) {
      console.error('Failed to load inventory:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => { loadInventory() }, [loadInventory])

  const filtered = useMemo(() => stock.filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase()) && (categoryFilter === 'all' || item.categoryKey === categoryFilter) && (stockFilter === 'all' || item.statusKey === stockFilter)), [stock, search, categoryFilter, stockFilter])
  const handleSave = async (formData) => {
    if (editingItem) { await api.put(`/inventory/${editingItem._id}`, formData); showToast('Plant updated successfully') }
    else { await api.post('/inventory', formData); showToast('Plant added successfully') }
    await loadInventory()
  }
  const removeItem = useCallback(async (item) => {
    if (!window.confirm(`Delete "${item.name}" from inventory? This cannot be undone.`)) return
    try {
      await api.del(`/inventory/${item._id}`)
      showToast('Plant deleted successfully')
      await loadInventory()
    } catch (err) {
      console.error('Failed to remove item:', err.message)
    }
  }, [loadInventory])

  return (
    <div className="page-content">
      <div className="page-header"><div className="dash-title">{t('inventoryTitle')}</div><div className="dash-subtitle">{t('inventorySubtitle')}</div></div>
      <div className="grid grid-4 mb-24"><DashboardCard icon="🌿" label={t('statTotalPlants')} value={summary.total} /><DashboardCard icon="✅" label={t('statusInStock')} value={summary.inStock} /><DashboardCard icon="⚠️" label={t('statusLowStock')} value={summary.lowStock} /><DashboardCard icon="❌" label={t('statusOutOfStock')} value={summary.outOfStock} /></div>
      {toast && <div className="badge badge-success mb-16" style={{ display: 'inline-block' }}>{toast}</div>}
      <div className="card">
        <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 10 }}><div className="section-title" style={{ marginBottom: 0 }}>{t('stockList')}</div><button className="btn btn-primary btn-sm" onClick={() => { setEditingItem(null); setModalOpen(true) }}>+ {t('addPlant')}</button></div>
        <div className="flex-gap mb-16" style={{ flexWrap: 'wrap' }}><div className="search-bar" style={{ maxWidth: 260 }}><span>⌕</span><input placeholder="Search plant name..." value={search} onChange={(event) => setSearch(event.target.value)} /></div><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>{categoryFilterOptions.map((category) => <option key={category.key} value={category.key}>{category.label}</option>)}</select><select value={stockFilter} onChange={(event) => setStockFilter(event.target.value)}><option value="all">All Stock Levels</option><option value="statusInStock">In Stock</option><option value="statusLowStock">Low Stock</option><option value="statusOutOfStock">Out of Stock</option></select></div>
        <div className="grid grid-1" style={{ gap: 16 }}>
          {filtered.map((item) => <div key={item._id} className="card" style={{ padding: 16 }}>
            <div className="flex-between mb-12" style={{ flexWrap: 'wrap', gap: 8 }}><div className="flex-gap"><div className="inventory-thumb">{getPlantImage(item) ? <img src={getPlantImage(item)} alt={item.name} onError={(event) => { event.currentTarget.style.display = 'none' }} /> : item.emoji || '🌿'}</div><div><h3 style={{ margin: '0 0 4px' }}>{item.name}</h3><div className="text-muted" style={{ fontSize: 12.5 }}>{t(item.categoryKey)}</div></div></div><span className={`badge ${statusBadge[item.statusKey]}`}>{t(item.statusKey)}</span></div>
            <div className="inventory-summary-row">
              <div className="inventory-summary-metrics">
                <div className="inventory-metric"><span>STOCK</span><strong>{item.qty} units</strong></div>
                <div className="inventory-metric"><span>AVAILABILITY</span><strong><i className={`availability-dot ${item.availability === 'Available' ? 'is-available' : item.availability === 'Limited' ? 'is-limited' : 'is-unavailable'}`} />{item.availability || '—'}</strong></div>
              </div>
              <div className="inventory-actions" role="group" aria-label={`${item.name} actions`}>
                <button className="icon-action details" onClick={() => setDetailsItem(item)} title="View plant details" aria-label="View plant details"><Icon type="details" /></button>
                <button className="icon-action edit" onClick={() => { setEditingItem(item); setModalOpen(true) }} title="Edit plant" aria-label="Edit plant"><Icon type="edit" /></button>
                <button className="icon-action delete" onClick={() => removeItem(item)} title="Delete plant" aria-label="Delete plant"><Icon type="delete" /></button>
              </div>
            </div>
          </div>)}
        </div>
        {!loading && filtered.length === 0 && <p className="empty-state">{t('noPlantsMatch')}</p>}
      </div>
      {modalOpen && <PlantFormModal initial={editingItem} onClose={() => setModalOpen(false)} onSave={handleSave} variantStock />}
      {detailsItem && <InventoryDetails item={detailsItem} onClose={() => setDetailsItem(null)} />}
    </div>
  )
}

export default Inventory
