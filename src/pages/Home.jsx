import { useState, useRef, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'

function Home() {
  // useState - manages simple mobile menu open/close state
  const [menuOpen, setMenuOpen] = useState(false)

  // useContext - reads login state and the translation helper from AppContext
  const { isLoggedIn, t } = useContext(AppContext)

  // useRef - references the "features" section to scroll to it, without causing re-renders
  const featuresRef = useRef(null)

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div>
      <div className="hero">
        <div>
          <h1>{t('homeWelcomeTo')} <br />{t('homeBrand')}</h1>
          <p>{t('homeTagline')}</p>
          <div className="hero-actions">
            <Link to="/plants" className="btn" style={{ background: '#fff', color: 'var(--primary-dark)' }}>{t('homeShopNow')}</Link>
            <button className="btn btn-outline" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.6)' }} onClick={scrollToFeatures}>
              {t('homeExplore')}
            </button>
            {!isLoggedIn && (
              <Link to="/login" className="btn btn-outline" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.6)' }}>
                {t('login')}
              </Link>
            )}
          </div>
          {menuOpen && <p style={{ marginTop: 12, fontSize: 'calc(12px * var(--font-scale, 1))', opacity: .8 }}>{t('homeMenuOpen')}</p>}
        </div>
        <div className="hero-emoji">🪴</div>
      </div>

      <div className="landing-section" ref={featuresRef}>
        <h2 style={{ textAlign: 'center', color: 'var(--text)' }}>{t('homeWhyChoose')}</h2>
        <div className="feature-grid">
          <div className="feature-item card">
            <div className="icon">🌱</div>
            <h3>{t('homeFeature1Title')}</h3>
            <p className="text-muted" style={{ fontSize: 'calc(13.5px * var(--font-scale, 1))' }}>{t('homeFeature1Sub')}</p>
          </div>
          <div className="feature-item card">
            <div className="icon">🧑‍🌾</div>
            <h3>{t('homeFeature2Title')}</h3>
            <p className="text-muted" style={{ fontSize: 'calc(13.5px * var(--font-scale, 1))' }}>{t('homeFeature2Sub')}</p>
          </div>
          <div className="feature-item card">
            <div className="icon">🩺</div>
            <h3>{t('homeFeature3Title')}</h3>
            <p className="text-muted" style={{ fontSize: 'calc(13.5px * var(--font-scale, 1))' }}>{t('homeFeature3Sub')}</p>
          </div>
          <div className="feature-item card">
            <div className="icon">🚚</div>
            <h3>{t('homeFeature4Title')}</h3>
            <p className="text-muted" style={{ fontSize: 'calc(13.5px * var(--font-scale, 1))' }}>{t('homeFeature4Sub')}</p>
          </div>
        </div>
      </div>

      <button
        className="btn btn-ghost"
        style={{ display: 'block', margin: '0 auto 30px' }}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        {t('homeToggleBanner')}
      </button>

      <div className="site-footer">{t('homeFooter')}</div>
    </div>
  )
}

export default Home
