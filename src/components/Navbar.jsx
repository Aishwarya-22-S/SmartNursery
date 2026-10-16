import { useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import SettingsMenu from './SettingsMenu.jsx'

// Maps each dashboard route to a translation key, shown as the current
// page name in the center of the top navbar.
const pageTitleKeys = {
  '/': 'home',
  '/admin': 'adminDashboard',
  '/staff': 'staffDashboard',
  '/customer': 'customerDashboard',
  '/customer-dashboard': 'customerDashboard',
  '/plants': 'plantCatalog',
  '/disease-detection': 'diseaseDetection',
  '/plant-health': 'plantHealth',
  '/care-guide': 'careGuide',
  '/inventory': 'inventory',
  '/cart': 'cart',
  '/checkout': 'checkout',
  '/order-tracking': 'orderTracking',
  '/order-history': 'orderHistory',
  '/payment-verification': 'paymentVerification',
  '/wishlist': 'wishlist',
  '/notifications': 'notifications',
  '/chatbot': 'chatbot',
  '/iot': 'iot',
  '/analytics': 'analytics',
  '/profile': 'profile',
}

// Top navbar shown above the page content, next to the permanent sidebar.
// Left: hamburger + brand. Center: current page name. Right: search,
// theme toggle, settings dropdown and profile avatar.
function Navbar({ onMenuClick }) {
  // useContext - reads theme, user and the translation helper from AppContext
  const { darkMode, toggleTheme, user, t } = useContext(AppContext)
  const location = useLocation()

  const titleKey = pageTitleKeys[location.pathname] || (location.pathname.startsWith('/plants/') ? 'plantDetails' : 'home')

  return (
    <div className="top-navbar">
      <div className="flex-gap">
        <button className="icon-btn hamburger-btn" onClick={onMenuClick} aria-label="Toggle menu">☰</button>
        <span className="brand-logo" style={{ fontSize: 'calc(16px * var(--font-scale, 1))' }}>🌿 GreenLeaf</span>
      </div>

      <div className="navbar-page-title">{t(titleKey)}</div>

      <div className="nav-actions">
        <div className="search-bar" style={{ minWidth: 180 }}>
          <span>🔍</span>
          <input placeholder={`${t('search')}...`} />
        </div>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {darkMode ? '🌙 Dark' : '☀️ Light'}
        </button>
        <SettingsMenu />
        <div className="avatar">{user.name[0]}</div>
      </div>
    </div>
  )
}

export default Navbar
