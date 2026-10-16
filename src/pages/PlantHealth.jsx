import { useState, useContext, useRef, useCallback } from 'react'
import { AppContext } from '../context/AppContext.jsx'
import { api } from '../services/api.js'

const tabKeys = [
  { key: 'Overview', labelKey: 'tabOverview' },
  { key: 'History', labelKey: 'tabHistory' },
  { key: 'Alerts', labelKey: 'tabAlerts' },
]

const statusBadge = { Good: 'badge-success', Moderate: 'badge-warning', Poor: 'badge-danger' }
const severityBadge = { low: 'badge-info', medium: 'badge-warning', high: 'badge-danger' }

// PlantHealth - Admin/Staff/Customer all land on this same page. Nothing
// is hard-coded to one plant: typing a name and searching hits
// GET /api/plant-health/search?name=..., which resolves that plant from
// the catalog and returns its (MongoDB-stored, clearly simulated/demo)
// monitoring record - growth, water level, soil moisture, history and
// alerts - so "Mango" and "Rose" show genuinely different data.
function PlantHealth() {
  const { t } = useContext(AppContext)

  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('Overview')
  const [plant, setPlant] = useState(null)
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const inputRef = useRef(null)

  const runSearch = useCallback(async (name) => {
    const trimmed = (name ?? query).trim()
    if (!trimmed) return
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const res = await api.get(`/plant-health/search?name=${encodeURIComponent(trimmed)}`)
      setPlant(res.plant)
      setHealth(res.health)
      setTab('Overview')
    } catch (err) {
      setPlant(null)
      setHealth(null)
      setError(err.message || 'No plant found.')
    } finally {
      setLoading(false)
    }
  }, [query])

  const handleSubmit = (e) => {
    e.preventDefault()
    runSearch()
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="dash-title">{t('plantHealth')}</div>
        <div className="dash-subtitle">Search any plant to see its live monitoring data.</div>
      </div>

      <form className="search-bar mb-24" style={{ maxWidth: 420 }} onSubmit={handleSubmit}>
        <span onClick={() => inputRef.current?.focus()}>🔍</span>
        <input
          ref={inputRef}
          placeholder='Search a plant, e.g. "Mango", "Rose", "Snake Plant"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm">{t('search')}</button>
      </form>

      {loading && <p className="text-muted">Loading plant health data...</p>}
      {!loading && error && <p className="empty-state">{error}</p>}
      {!loading && !searched && !plant && (
        <p className="text-muted">Search for a plant by name to view its growth, water level, soil moisture, history and alerts.</p>
      )}

      {!loading && plant && health && (
        <div className="grid grid-2">
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 340 }}>
            <span style={{ fontSize: 'calc(140px * var(--font-scale, 1))' }}>{plant.emoji || '🌿'}</span>
          </div>
          <div className="card">
            <div className="flex-between">
              <div>
                <h2>{plant.name}</h2>
                <p className="text-muted">{t('overallHealth')}</p>
                <span className={`badge ${statusBadge[health.healthStatus] || 'badge-success'} mt-8`} style={{ fontSize: 'calc(13px * var(--font-scale, 1))' }}>
                  {health.healthStatus} {health.healthStatus === 'Good' ? '✅' : health.healthStatus === 'Moderate' ? '⚠️' : '🔴'}
                </span>
                {health.isSimulated && (
                  <p className="text-muted mt-8" style={{ fontSize: 'calc(11px * var(--font-scale, 1))' }}>
                    Simulated/demo monitoring data (no physical sensor connected) · last checked {new Date(health.lastChecked).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="chip-row mt-24 mb-16">
              {tabKeys.map((tabItem) => (
                <button key={tabItem.key} className={`chip ${tab === tabItem.key ? 'active' : ''}`} onClick={() => setTab(tabItem.key)}>{t(tabItem.labelKey)}</button>
              ))}
            </div>

            {tab === 'Overview' && (
              <div className="grid grid-2">
                <div className="card" style={{ textAlign: 'center' }}>
                  <p className="text-muted" style={{ fontSize: 'calc(12.5px * var(--font-scale, 1))' }}>{t('healthScore')}</p>
                  <svg width="120" height="120" viewBox="0 0 120 120" style={{ margin: '10px auto' }}>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--primary-light)" strokeWidth="12" />
                    <circle
                      cx="60" cy="60" r="50" fill="none" stroke="var(--primary)" strokeWidth="12"
                      strokeDasharray={`${(health.overallHealthScore / 100) * 314} 314`} strokeLinecap="round" transform="rotate(-90 60 60)"
                    />
                    <text x="60" y="65" textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--text)">{health.overallHealthScore}</text>
                  </svg>
                  <p style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>{health.healthStatus}</p>
                </div>
                <div>
                  <div style={{ marginBottom: '16px', padding: '10px', backgroundColor: 'var(--bg-secondary, #f9f9f9)', borderRadius: 8 }}>
                    <div className="flex-between"><span>🌱 Growth</span><span style={{ fontWeight: 600 }}>{health.growth}% – {health.growth > 70 ? 'Excellent' : health.growth > 50 ? 'Good' : 'Needs Attention'}</span></div>
                    <div className="text-muted" style={{ fontSize: 'calc(11px * var(--font-scale, 1))' }}>How much the plant has grown</div>
                  </div>
                  <div style={{ marginBottom: '16px', padding: '10px', backgroundColor: 'var(--bg-secondary, #f9f9f9)', borderRadius: 8 }}>
                    <div className="flex-between"><span>💧 Water Status</span><span style={{ fontWeight: 600 }}>{health.waterLevel}% – {health.waterLevel > 60 ? 'Adequate' : health.waterLevel > 40 ? 'Normal' : 'Low'}</span></div>
                    <div className="text-muted" style={{ fontSize: 'calc(11px * var(--font-scale, 1))' }}>Current water in plant tissues</div>
                  </div>
                  <div style={{ marginBottom: '16px', padding: '10px', backgroundColor: 'var(--bg-secondary, #f9f9f9)', borderRadius: 8 }}>
                    <div className="flex-between"><span>🌍 Soil Moisture</span><span style={{ fontWeight: 600 }}>{health.soilMoisture}% – {health.soilMoisture > 60 ? 'Wet' : health.soilMoisture > 40 ? 'Optimal' : 'Dry'}</span></div>
                    <div className="text-muted" style={{ fontSize: 'calc(11px * var(--font-scale, 1))' }}>How much water is in the soil around roots</div>
                  </div>
                  <div style={{ marginBottom: '16px', padding: '10px', backgroundColor: 'var(--bg-secondary, #f9f9f9)', borderRadius: 8 }}>
                    <div className="flex-between"><span>☀️ Sunlight</span><span style={{ fontWeight: 600 }}>{health.sunlightHours} hrs/day – {health.sunlightHours > 6 ? 'Sufficient' : health.sunlightHours > 3 ? 'Adequate' : 'Low'}</span></div>
                    <div className="text-muted" style={{ fontSize: 'calc(11px * var(--font-scale, 1))' }}>Hours of direct/indirect light</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary, #f9f9f9)', borderRadius: 8 }}>
                    <div className="flex-between"><span>🌡️ Temperature</span><span style={{ fontWeight: 600 }}>{health.temperature}°C – {health.temperature > 20 && health.temperature < 30 ? 'Optimal' : 'Check Environment'}</span></div>
                    <div className="text-muted" style={{ fontSize: 'calc(11px * var(--font-scale, 1))' }}>Current ambient temperature</div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'History' && (
              health.history?.length ? (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Date</th><th>Growth</th><th>Soil Moisture</th><th>Water</th><th>Status</th><th>Observation</th></tr></thead>
                    <tbody>
                      {[...health.history].reverse().map((h, i) => (
                        <tr key={i}>
                          <td>{new Date(h.date).toLocaleDateString()}</td>
                          <td>{h.growth}%</td>
                          <td>{h.soilMoisture}%</td>
                          <td>{h.waterLevel}%</td>
                          <td><span className={`badge ${statusBadge[h.healthStatus] || 'badge-success'}`}>{h.healthStatus}</span></td>
                          <td className="text-muted">{h.observation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="text-muted">No previous health records for this plant yet.</p>
            )}

            {tab === 'Alerts' && (
              health.alerts?.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {health.alerts.map((a, i) => (
                    <div key={i} className="flex-between" style={{ padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10 }}>
                      <span>⚠️ {a.message}</span>
                      <span className={`badge ${severityBadge[a.severity] || 'badge-warning'}`}>{a.severity}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted">{t('noActiveAlerts')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PlantHealth
