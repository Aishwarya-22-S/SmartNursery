import { useState } from 'react'

const categoryOptions = [
  { key: 'catIndoor', label: 'Indoor Plants' }, { key: 'catOutdoor', label: 'Outdoor Plants' }, { key: 'catSucculents', label: 'Succulents' },
  { key: 'catFlowering', label: 'Flowering Plants' }, { key: 'catFruit', label: 'Fruit Plants' }, { key: 'catAir', label: 'Air-Purifying Plants' },
]
const sizeLabels = { small: 'Small', medium: 'Medium', large: 'Large' }
const emptyForm = {
  name: '', categoryKey: 'catIndoor', price: '', qty: '', emoji: '🌿', imageUrl: '', description: '',
  sunlightKey: 'sunLowIndirect', waterKey: 'waterFreq', careLevelKey: 'careEasy', height: '', soilType: '', fertilizerInfo: '',
  supplier: '', purchasedFrom: '', supplierContact: '', purchasePrice: '', location: '',
  sizes: { small: '', medium: '', large: '' }, prices: { small: '', medium: '', large: '' },
  purchasePrices: { small: '', medium: '', large: '' },
}

function makeInitialForm(initial) {
  if (!initial) return emptyForm
  const savedSizes = { ...emptyForm.sizes, ...(initial.sizes || {}) }
  const savedSizeTotal = Object.values(savedSizes).reduce((sum, value) => sum + Number(value || 0), 0)
  // Older records only had one total qty field. Keep that stock visible in
  // the Medium variant until the admin distributes it across plant sizes.
  if (savedSizeTotal === 0 && Number(initial.qty || 0) > 0) savedSizes.medium = Number(initial.qty)
  const legacyCost = Number(initial.purchasePrice || 0)
  const legacyPurchasePrices = {
    small: Math.round(legacyCost * 0.7),
    medium: legacyCost,
    large: Math.round(legacyCost * 1.4),
  }
  return {
    ...emptyForm,
    ...initial,
    sizes: savedSizes,
    prices: { ...emptyForm.prices, ...(initial.prices || {}) },
    purchasePrices: {
      small: initial.purchasePrices?.small ?? legacyPurchasePrices.small,
      medium: initial.purchasePrices?.medium ?? legacyPurchasePrices.medium,
      large: initial.purchasePrices?.large ?? legacyPurchasePrices.large,
    },
  }
}

function PlantFormModal({ initial, onClose, onSave, variantStock = false }) {
  const [form, setForm] = useState(() => makeInitialForm(initial))
  const [selectedStockSize, setSelectedStockSize] = useState('medium')
  const [selectedPriceSize, setSelectedPriceSize] = useState('medium')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const update = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.value }))
  const updateSizeQuantity = (size) => (event) => {
    const value = event.target.value
    setForm((previous) => {
      const sizes = { ...previous.sizes, [size]: value }
      const qty = Object.values(sizes).reduce((sum, count) => sum + Number(count || 0), 0)
      return { ...previous, sizes, qty: String(qty) }
    })
  }
  const updateSelectedPrice = (event) => setForm((previous) => ({ ...previous, prices: { ...previous.prices, [selectedPriceSize]: event.target.value } }))
  const updateSelectedPurchasePrice = (event) => setForm((previous) => ({ ...previous, purchasePrices: { ...previous.purchasePrices, [selectedPriceSize]: event.target.value } }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.name.trim() || (!variantStock && form.qty === '') || (form.prices?.medium === '' && form.price === '')) { setError('Name, medium selling price and stock quantity are required.'); return }
    setSaving(true)
    setError('')
    try {
      const sizes = Object.fromEntries(Object.entries(form.sizes || {}).map(([key, value]) => [key, Number(value || 0)]))
      const totalQuantity = Object.values(sizes).reduce((sum, value) => sum + value, 0)
      const purchasePrices = Object.fromEntries(Object.entries(form.purchasePrices || {}).map(([key, value]) => [key, Number(value || 0)]))
      const prices = Object.fromEntries(Object.entries(form.prices || {}).map(([key, value]) => [key, Number(value === '' && key === 'medium' ? form.price || 0 : value || 0)]))
      await onSave({
        ...form,
        price: Number(prices.medium ?? form.price ?? 0),
        qty: variantStock ? totalQuantity : Number(form.qty),
        sizes,
        prices,
        purchasePrices,
        purchasePrice: Number(purchasePrices.medium ?? form.purchasePrice ?? 0),
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Could not save this plant.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(event) => event.stopPropagation()}>
        <div className="flex-between mb-16"><h3 style={{ margin: 0 }}>{initial ? 'Edit Plant' : 'Add Plant'}</h3><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="field"><label>Plant Name</label><input value={form.name} onChange={update('name')} placeholder="e.g. Mango" /></div>
            <div className="field"><label>Category</label><select value={form.categoryKey} onChange={update('categoryKey')}>{categoryOptions.map((category) => <option key={category.key} value={category.key}>{category.label}</option>)}</select></div>
            {variantStock ? (
              <div className="field"><label>Total Stock Quantity</label><input type="number" min="0" value={Object.values(form.sizes || {}).reduce((sum, value) => sum + Number(value || 0), 0)} readOnly aria-readonly="true" /><small className="text-muted">Automatically totals stock across all sizes.</small></div>
            ) : (
              <div className="field"><label>Stock Quantity</label><input type="number" min="0" value={form.qty} onChange={update('qty')} /></div>
            )}
            <div className="field"><label>Emoji / Icon</label><input value={form.emoji} onChange={update('emoji')} placeholder="🌿" /></div>
            <div className="field"><label>Height</label><input value={form.height} onChange={update('height')} placeholder="e.g. 30-45 cm" /></div>
          </div>
          {variantStock && (
            <div className="variant-stock-editor">
              <div className="size-editor-title">STOCK QUANTITY BY SIZE</div>
              <div className="size-choice-row stock-size-selector" role="group" aria-label="Select plant size">
                {Object.keys(sizeLabels).map((size) => <button type="button" key={size} className={`size-choice ${selectedStockSize === size ? 'active' : ''}`} aria-pressed={selectedStockSize === size} onClick={() => setSelectedStockSize(size)}><span className={`size-dot size-${size}`} />{sizeLabels[size]}</button>)}
              </div>
              <div className="field stock-selected-quantity">
                <label htmlFor="stock-selected-size">{sizeLabels[selectedStockSize]} quantity</label>
                <input id="stock-selected-size" type="number" min="0" step="1" value={form.sizes?.[selectedStockSize] ?? ''} onChange={updateSizeQuantity(selectedStockSize)} />
              </div>
              <small className="text-muted">Select a size to view and update only that size’s stock. Total stock updates automatically.</small>
            </div>
          )}
          <div className="size-price-editor">
            <div className="size-editor-title">SIZE-SPECIFIC SELLING & PURCHASE PRICES</div>
            <div className="size-choice-row">{Object.keys(sizeLabels).map((size) => <button type="button" key={size} className={`size-choice ${selectedPriceSize === size ? 'active' : ''}`} onClick={() => setSelectedPriceSize(size)}><span className={`size-dot size-${size}`} />{sizeLabels[size]}</button>)}</div>
            <div className="grid grid-2" style={{ marginTop: 14 }}>
              <div className="field"><label>{sizeLabels[selectedPriceSize]} selling price (₹)</label><input type="number" min="0" value={form.prices?.[selectedPriceSize] ?? (selectedPriceSize === 'medium' ? form.price : '')} onChange={updateSelectedPrice} placeholder="Enter selling price" /></div>
              <div className="field"><label>{sizeLabels[selectedPriceSize]} purchase price (₹)</label><input type="number" min="0" value={form.purchasePrices?.[selectedPriceSize] ?? ''} onChange={updateSelectedPurchasePrice} placeholder="Enter purchase cost" /></div>
            </div>
            <small className="text-muted">Select a size above to update its own selling and purchase prices.</small>
          </div>
          <div style={{ marginTop: 16, padding: 12, backgroundColor: 'var(--bg-secondary, #f5f5f5)', borderRadius: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 12 }}>INVENTORY & SUPPLIER INFO</div>
            <div className="grid grid-2">
              <div className="field"><label>Supplier/Vendor</label><input value={form.supplier} onChange={update('supplier')} /></div>
              <div className="field"><label>Purchased From</label><input value={form.purchasedFrom} onChange={update('purchasedFrom')} /></div>
              <div className="field"><label>Supplier Contact</label><input value={form.supplierContact} onChange={update('supplierContact')} /></div>
              <div className="field" style={{ gridColumn: '1 / -1' }}><label>Location/Storage</label><input value={form.location} onChange={update('location')} /></div>
            </div>
          </div>
          {error && <p className="text-muted" style={{ color: 'var(--danger, #d32f2f)' }}>{error}</p>}
          <div className="flex-gap mt-16"><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Plant'}</button><button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button></div>
        </form>
      </div>
    </div>
  )
}

export default PlantFormModal
