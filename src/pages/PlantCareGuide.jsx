import { useState, useContext, useRef } from 'react'
import { AppContext } from '../context/AppContext.jsx'
import { api } from '../services/api.js'

const categories = [
  { key: 'watering', labelKey: 'careWatering', icon: '💧' },
  { key: 'sunlight', labelKey: 'careSunlight', icon: '☀️' },
  { key: 'fertilizer', labelKey: 'careFertilizer', icon: '🌱' },
  { key: 'pruning', labelKey: 'carePruning', icon: '✂️' },
  { key: 'pest', labelKey: 'carePest', icon: '🐛' },
  { key: 'season', labelKey: 'careSeason', icon: '🍂' },
]

// PlantCareGuide - the whole page is driven by whichever plant the
// customer searches for (section G of the spec). Each plant in the
// catalog carries its own `care` text for every section, so searching
// "Mango" vs "Rose" vs "Snake Plant" genuinely shows different guidance
// instead of one fixed plant's text.
function PlantCareGuide() {
  const { t } = useContext(AppContext)

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState('watering')
  const [plant, setPlant] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const inputRef = useRef(null)

  const active = categories.find((c) => c.key === selected)

  const runSearch = async (e) => {
    e?.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const res = await api.get(`/plants?search=${encodeURIComponent(trimmed)}`)
      const match = res.plants.find((p) => p.name.toLowerCase() === trimmed.toLowerCase())
        || res.plants.find((p) => p.name.toLowerCase().includes(trimmed.toLowerCase()))
      if (!match) {
        setPlant(null)
        setError(`No plant found matching "${trimmed}".`)
      } else {
        setPlant(match)
      }
    } catch (err) {
      setPlant(null)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="dash-title">{t('careGuideTitle')}</div>
      </div>

      <form className="search-bar mb-24" style={{ maxWidth: 420 }} onSubmit={runSearch}>
        <span onClick={() => inputRef.current?.focus()}>🔍</span>
        <input
          ref={inputRef}
          placeholder='Search a plant, e.g. "Mango", "Rose", "Snake Plant"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm">{t('search')}</button>
      </form>

      {loading && <p className="text-muted">Searching...</p>}
      {!loading && error && <p className="empty-state">{error}</p>}
      {!loading && !searched && !plant && (
        <p className="text-muted">Search for a plant by name to see watering, sunlight, fertilizer, pruning, pest control and seasonal care tips specific to it.</p>
      )}

      {!loading && plant && (
        <div className="care-guide-layout">
          <div className="care-guide-nav">
            {categories.map((c) => (
              <button
                key={c.key}
                className={`care-nav-item ${selected === c.key ? 'active' : ''}`}
                onClick={() => setSelected(c.key)}
              >
                <span>{c.icon}</span><span>{t(c.labelKey)}</span>
              </button>
            ))}
          </div>
          <div className="card" style={{ flex: 1 }}>
            <div style={{ fontSize: 'calc(44px * var(--font-scale, 1))' }}>{plant.emoji || '🪴'}</div>
            <h2>{plant.name}</h2>
            <p className="text-muted mb-24">{plant.description || t('carePlantDesc')}</p>
            <div className="grid grid-2 mb-16">
              <div><span className="text-muted" style={{ fontSize: 'calc(12px * var(--font-scale, 1))' }}>Soil Type</span><div style={{ fontWeight: 600 }}>🪴 {plant.soilType}</div></div>
              <div><span className="text-muted" style={{ fontSize: 'calc(12px * var(--font-scale, 1))' }}>Fertilizer</span><div style={{ fontWeight: 600 }}>🌿 {plant.fertilizerInfo}</div></div>
            </div>
            <div className="card" style={{ background: 'var(--primary-light)', border: 'none' }}>
              <div className="flex-gap mb-8">
                <span style={{ fontSize: 'calc(22px * var(--font-scale, 1))' }}>{active.icon}</span>
                <strong>{t(active.labelKey)}</strong>
              </div>
              <p style={{ fontSize: 'calc(14px * var(--font-scale, 1))' }}>{plant.care?.[active.key] || t(`care${active.key.charAt(0).toUpperCase()}${active.key.slice(1)}Text`)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlantCareGuide
