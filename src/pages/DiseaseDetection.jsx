import { useState, useRef, useContext, useEffect, useCallback } from 'react'
import { AppContext } from '../context/AppContext.jsx'
import { api } from '../services/api.js'

// DiseaseDetection - the image upload / "analyzing" UX is unchanged, but
// every result is now saved to MongoDB via POST /api/detections and
// "Recent Detection" is loaded from GET /api/detections (the logged-in
// user's own real previous detections), instead of two hard-coded rows.
// No real ML model runs here - AI results are clearly simulated/demo,
// same as before, just persisted now.
function DiseaseDetection() {
  const { t } = useContext(AppContext)

  const [selectedImage, setSelectedImage] = useState(null)
  const [plantName, setPlantName] = useState('')
  const [result, setResult] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [recent, setRecent] = useState([])
  const [loadingRecent, setLoadingRecent] = useState(true)

  const fileInputRef = useRef(null)

  const loadRecent = useCallback(async () => {
    try {
      const res = await api.get('/detections')
      setRecent(res.detections)
    } catch (err) {
      console.error('Failed to load detections:', err.message)
    } finally {
      setLoadingRecent(false)
    }
  }, [])

  useEffect(() => {
    loadRecent()
  }, [loadRecent])

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    setSelectedImage(dataUrl)
    setResult(null)
    setAnalyzing(true)
    try {
      const res = await api.post('/detections', { image: dataUrl, plantName })
      setResult(res.detection)
      setRecent((prev) => [res.detection, ...prev])
    } catch (err) {
      console.error('Detection failed:', err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
      <div className="page-content">
        <div className="grid grid-2">
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 className="mb-16">{t('uploadLeafImage')}</h3>
            <p className="text-muted mb-16" style={{ fontSize: 'calc(13px * var(--font-scale, 1))' }}>{t('aiWillDetect')}</p>
            <div className="field" style={{ textAlign: 'left' }}>
              <input
                type="text"
                placeholder="Plant name (optional, e.g. Rose)"
                value={plantName}
                onChange={(e) => setPlantName(e.target.value)}
              />
            </div>
            <div
              style={{
                border: '2px dashed var(--border)', borderRadius: 14, padding: '50px 20px',
                background: selectedImage ? 'transparent' : 'var(--bg)', cursor: 'pointer',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedImage ? (
                <img src={selectedImage} alt="leaf" style={{ maxHeight: 200, borderRadius: 10 }} />
              ) : (
                <>
                  <div style={{ fontSize: 'calc(40px * var(--font-scale, 1))' }}>📷</div>
                  <p style={{ fontWeight: 600, marginTop: 10 }}>{t('dragDrop')}</p>
                  <p className="text-muted" style={{ fontSize: 'calc(12.5px * var(--font-scale, 1))' }}>{t('orText')}</p>
                </>
              )}
              <button type="button" className="btn btn-ghost btn-sm mt-8" style={{ color: 'var(--primary)' }}>{t('browseFile')}</button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />

            {analyzing && <p className="mt-16 text-muted">{t('analyzing')}</p>}

            {result && (
              <div className="card mt-24" style={{ textAlign: 'left', background: 'var(--warning-bg)', border: 'none' }}>
                <div className="flex-between mb-12">
                  <div>
                    <h3 style={{ margin: '0 0 4px 0' }}>{result.disease}</h3>
                    <div className="text-muted" style={{ fontSize: 'calc(12px * var(--font-scale, 1))' }}>
                      {result.plantName ? `Detected in: ${result.plantName}` : 'Unnamed plant'}
                    </div>
                  </div>
                  <span className="badge badge-warning" style={{ whiteSpace: 'nowrap' }}>Confidence: {result.confidence}%</span>
                </div>
                <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '12px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontWeight: 600, fontSize: 'calc(12px * var(--font-scale, 1))', marginBottom: '4px' }}>📋 Symptoms Observed:</div>
                    <div className="text-muted" style={{ fontSize: 'calc(13px * var(--font-scale, 1))' }}>
                      {result.advice.includes('spots') || result.disease.includes('Spot') ? '• Dark or discolored spots on leaves and stems' : ''}
                      {result.advice.includes('wilt') ? '• Wilting or drooping leaves' : ''}
                      {result.advice.includes('powder') ? '• Powdery white coating on leaves' : ''}
                      {result.advice.includes('web') ? '• Fine webbing on leaves (spider mites)' : ''}
                      {result.disease === 'Healthy' ? '✓ Plant appears healthy with no visible disease' : '• ' + (result.disease || 'Disease detected')}
                    </div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontWeight: 600, fontSize: 'calc(12px * var(--font-scale, 1))', marginBottom: '4px' }}>💊 Recommended Treatment:</div>
                    <div className="text-muted" style={{ fontSize: 'calc(13px * var(--font-scale, 1))' }}>
                      {result.advice}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'calc(12px * var(--font-scale, 1))', marginBottom: '4px' }}>🛡️ Prevention Tips:</div>
                    <div className="text-muted" style={{ fontSize: 'calc(13px * var(--font-scale, 1))' }}>
                      • Maintain proper air circulation and humidity levels
                      • Avoid overhead watering; water at soil level instead
                      • Remove and discard infected leaves immediately
                      • Isolate affected plants from healthy ones
                      • Inspect plants regularly for early signs
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <div className="section-title">{t('recentDetections')}</div>
            {loadingRecent && <p className="text-muted">Loading...</p>}
            {!loadingRecent && recent.length === 0 && (
              <p className="empty-state">No detections yet. Upload a leaf image to run your first check.</p>
            )}
            {recent.map((d) => (
              <div key={d._id} className="flex-between" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="flex-gap">
                  {d.image ? (
                    <img src={d.image} alt={d.plantName || 'leaf'} style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover' }} />
                  ) : (
                    <span className="stat-icon">🍃</span>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'calc(13.5px * var(--font-scale, 1))' }}>{d.plantName || 'Unnamed plant'}</div>
                    <div className="text-muted" style={{ fontSize: 'calc(12px * var(--font-scale, 1))' }}>{d.disease} · {t('accuracyLabel')}: {d.confidence}% · {new Date(d.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <span className={`badge ${d.status === 'Healthy' ? 'badge-success' : 'badge-warning'}`}>{d.status}</span>
              </div>
            ))}
          </div>
        </div>
    </div>
  )
}

export default DiseaseDetection
