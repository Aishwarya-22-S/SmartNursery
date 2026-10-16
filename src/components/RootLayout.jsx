import { useContext } from 'react'
import { Outlet } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import PublicLayout from './PublicLayout.jsx'
import DashboardLayout from './DashboardLayout.jsx'

// RootLayout - the single element every route mounts under. It:
// 1. Applies the Light/Dark theme class, the Font Size class, and the
//    Accent Color class app-wide - these are the three pieces of the
//    global Settings system, all driven from AppContext.
// 2. Decides which chrome to show: the public navbar (logged out) or the
//    full sidebar dashboard (logged in). The matched page still renders
//    through <Outlet /> either way.
function RootLayout() {
  // useContext - reads theme, font size, accent color, login state and the
  // global toast stack from AppContext
  const { darkMode, fontSize, accentColor, isLoggedIn, toasts, dismissToast } = useContext(AppContext)

  const accentClass = accentColor && accentColor !== 'green' ? `accent-${accentColor}` : ''

  return (
    <div className={`app-shell ${darkMode ? 'dark-theme' : ''} font-${fontSize} ${accentClass}`}>
      {isLoggedIn ? <DashboardLayout /> : <PublicLayout />}
      <div className="toast-stack">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`} onClick={() => dismissToast(toast.id)}>
            <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RootLayout
