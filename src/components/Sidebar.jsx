import { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'

// Each role sees a DIFFERENT sidebar, built only from the routes that role
// is actually allowed to open (see App.jsx / RequireAuth for the routes
// themselves - this is a UI convenience, not the security boundary).
const adminMenu = [
  { to: '/admin', key: 'adminDashboard', icon: '📊', end: true },
  { to: '/staff', key: 'staffDashboard', icon: '👨‍💼' },
  { to: '/plants', key: 'plantCatalog', icon: '🌿' },
  { to: '/inventory', key: 'inventory', icon: '📦' },
  { to: '/payment-verification', key: 'paymentVerification', icon: '💰' },
  { to: '/analytics', key: 'analytics', icon: '📊' },
  { to: '/plant-health', key: 'plantHealth', icon: '🌱' },
  { to: '/disease-detection', key: 'diseaseDetection', icon: '🔬' },
  // Admin has no Notifications module (section 1.H of the spec) - not
  // included here, and the /notifications route itself blocks Admin too.
]

const staffMenu = [
  { to: '/staff', key: 'staffDashboard', icon: '📊', end: true },
  { to: '/plants', key: 'plantCatalog', icon: '🌿' },
  { to: '/inventory', key: 'inventory', icon: '📦' },
  { to: '/payment-verification', key: 'paymentVerification', icon: '💰' },
  { to: '/plant-health', key: 'plantHealth', icon: '🌱' },
  { to: '/disease-detection', key: 'diseaseDetection', icon: '🔬' },
  { to: '/notifications', key: 'notifications', icon: '🔔' },
]

const customerMenu = [
  { to: '/customer-dashboard', key: 'customerDashboard', icon: '👤', end: true },
  { to: '/plants', key: 'plantCatalog', icon: '🌿' },
  { to: '/wishlist', key: 'wishlist', icon: '💝' },
  { to: '/cart', key: 'cart', icon: '🛒' },
  { to: '/order-tracking', key: 'orderTracking', icon: '📦' },
  { to: '/order-history', key: 'orderHistory', icon: '📋' },
  { to: '/plant-health', key: 'plantHealth', icon: '🌱' },
  { to: '/disease-detection', key: 'diseaseDetection', icon: '🔬' },
  { to: '/care-guide', key: 'careGuide', icon: '📚' },
  { to: '/chatbot', key: 'chatbot', icon: '💬' },
  { to: '/notifications', key: 'notifications', icon: '🔔' },
]

const menusByRole = { admin: adminMenu, staff: staffMenu, customer: customerMenu }

function Sidebar({ isOpen, onClose }) {
  // useContext - reads the translation helper, current user role and the
  // cart contents (for the live cart-count badge, section 3.A of the spec)
  const { t, user, cart } = useContext(AppContext)

  const menuItems = menusByRole[user?.role] || []
  const cartCount = (cart || []).reduce((sum, i) => sum + (i.qty || 1), 0)

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`dash-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-logo">
          🌿 GreenLeaf
          <span className="sub">NURSERY</span>
        </div>
        <div className="sidebar-links-scroll">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span className="label-text">{t(item.key)}</span>
              {item.key === 'cart' && cartCount > 0 && <span className="badge-count">{cartCount}</span>}
            </NavLink>
          ))}
          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span>👤</span>
            <span className="label-text">Profile</span>
          </NavLink>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
