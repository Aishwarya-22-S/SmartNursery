import { useContext, useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext, FONT_SIZES, ACCENT_COLORS } from '../context/AppContext.jsx'

const accentSwatchColors = {
  green: '#198754',
  blue: '#2563eb',
  purple: '#7c3aed',
  orange: '#ea580c',
  red: '#dc2626',
  teal: '#0d9488',
}

const accentLabelKeys = {
  green: 'colorGreen',
  blue: 'colorBlue',
  purple: 'colorPurple',
  orange: 'colorOrange',
  red: 'colorRed',
  teal: 'colorTeal',
}

// SettingsMenu - the ⚙️ Settings dropdown in the top navbar. This is the
// single centralized place to control every global setting: Profile,
// Font Size, Language, Theme and Accent Color, plus Logout.
function SettingsMenu() {
  // useContext - reads/updates every global setting from AppContext
  const {
    t,
    fontSize, setFontSize,
    language, setLanguage,
    darkMode, toggleTheme,
    accentColor, setAccentColor,
    logout,
  } = useContext(AppContext)

  // useState - controls whether the dropdown panel is open
  const [open, setOpen] = useState(false)

  // useRef - references the dropdown wrapper so we can detect outside clicks
  const menuRef = useRef(null)
  const navigate = useNavigate()

  // useEffect - closes the dropdown when the user clicks outside of it
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // useCallback - memoized logout handler passed to the Logout button
  const handleLogout = useCallback(() => {
    logout()
    setOpen(false)
    navigate('/')
  }, [logout, navigate])

  return (
    <div className="settings-menu" ref={menuRef}>
      <button className="icon-btn" onClick={() => setOpen((prev) => !prev)} aria-label="Settings">
        ⚙️
      </button>

      {open && (
        <div className="settings-dropdown">
          <div className="settings-dropdown-title">{t('settings')}</div>

          <Link to="/profile" className="settings-row" onClick={() => setOpen(false)}>
            <span>👤</span><span>{t('profile')}</span>
          </Link>

          <div className="settings-row-block">
            <div className="settings-row-label"><span>🔤</span><span>{t('fontSize')}</span></div>
            <div className="settings-options">
              {FONT_SIZES.map((f) => (
                <button
                  key={f}
                  className={`settings-pill ${fontSize === f ? 'active' : ''}`}
                  onClick={() => setFontSize(f)}
                >
                  {t(f)}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-row-block">
            <div className="settings-row-label"><span>🌐</span><span>{t('language')}</span></div>
            <div className="settings-options">
              <button className={`settings-pill ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')}>
                {t('english')}
              </button>
              <button className={`settings-pill ${language === 'ta' ? 'active' : ''}`} onClick={() => setLanguage('ta')}>
                {t('tamil')}
              </button>
            </div>
          </div>

          <div className="settings-row-block">
            <div className="settings-row-label"><span>{darkMode ? '🌙' : '☀️'}</span><span>{t('theme')}</span></div>
            <div className="settings-options">
              <button className={`settings-pill ${!darkMode ? 'active' : ''}`} onClick={() => darkMode && toggleTheme()}>
                {t('lightMode')}
              </button>
              <button className={`settings-pill ${darkMode ? 'active' : ''}`} onClick={() => !darkMode && toggleTheme()}>
                {t('darkMode')}
              </button>
            </div>
          </div>

          <div className="settings-row-block">
            <div className="settings-row-label"><span>🎨</span><span>{t('accentColor')}</span></div>
            <div className="accent-swatch-row">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color}
                  className={`accent-swatch ${accentColor === color ? 'active' : ''}`}
                  style={{ background: accentSwatchColors[color] }}
                  onClick={() => setAccentColor(color)}
                  aria-label={t(accentLabelKeys[color])}
                  title={t(accentLabelKeys[color])}
                />
              ))}
            </div>
          </div>

          <button className="settings-row settings-logout" onClick={handleLogout}>
            <span>🚪</span><span>{t('logout')}</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default SettingsMenu
