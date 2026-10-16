import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'

// PublicNavbar - shown only on the public (logged-out) area: Home, Plants,
// About, Contact and a Login button. No sidebar, no dashboard pages here.
function PublicNavbar() {
  // useContext - reads theme and language so the public navbar matches the app
  const { darkMode, toggleTheme, t } = useContext(AppContext)

  return (
    <div className="top-navbar">
      <Link to="/" className="brand-logo">
        🌿 GreenLeaf
        <span className="sub">NURSERY</span>
      </Link>
      <div className="nav-links">
        <Link to="/">{t('home')}</Link>
        <Link to="/plants">{t('plants')}</Link>
        <Link to="/about">{t('about')}</Link>
        <Link to="/contact">{t('contact')}</Link>
      </div>
      <div className="nav-actions">
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {darkMode ? '🌙 Dark' : '☀️ Light'}
        </button>
        <Link to="/login" className="btn btn-primary btn-sm">{t('login')}</Link>
      </div>
    </div>
  )
}

export default PublicNavbar
