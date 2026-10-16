import { useState, useRef, useEffect, useCallback, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import { roleHomePath } from '../utils/roles.js'
import { isGoogleAuthConfigured } from '../services/authService.js'

function Login() {
  // useState - manages email/password form fields
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // useContext - reads the login functions, session flag and translation helper from AppContext
  const { login, loginWithGoogle, isLoggedIn, user, t } = useContext(AppContext)
  const googleConfigured = isGoogleAuthConfigured()

  // useRef - references the email input to auto-focus it on mount
  const emailRef = useRef(null)

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  // If the user is already logged in and lands on /login, send them
  // straight to their role's dashboard instead of showing the form again.
  useEffect(() => {
    if (isLoggedIn) {
      const redirectTo = location.state?.from?.pathname || roleHomePath(user?.role)
      navigate(redirectTo, { replace: true })
    }
  }, [isLoggedIn, user, navigate, location])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // The authenticated account's role comes from the backend; the single
  // login form never asks the user to choose a role.
  const handleLogin = useCallback(async (e) => {
    e.preventDefault()
    const account = await login(form.email.trim(), form.password)
    if (account) {
      setError('')
      navigate(roleHomePath(account.role))
    } else {
      setError(t('loginInvalid'))
    }
  }, [form, login, navigate, t])

  const handleGoogleLogin = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      const account = await loginWithGoogle()
      navigate(roleHomePath(account.role))
    } catch (err) {
      setError(err?.message || 'Google sign-in failed.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="auth-card" style={{ maxWidth: 420, margin: '20px auto' }}>
      <div className="card">
        <div className="brand-logo" style={{ marginBottom: 20 }}>🌿 GreenLeaf<span className="sub">NURSERY</span></div>
        <h1>{t('welcomeBack')}</h1>
        <p className="subtitle">{t('loginSubtitle')}</p>
        <p className="text-muted" style={{ fontSize: 12 }}>Local demo first login: use an email ending in .admin, .staff, or .customer; password must be at least 6 characters.</p>

        {error && <div className="badge badge-danger mb-16" style={{ display: 'block', padding: '10px 14px' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="field">
            <label>{t('loginEmailLabel')}</label>
            <input ref={emailRef} type="email" name="email" autoComplete="username" required placeholder="you@example.com" value={form.email} onChange={handleChange} />
          </div>
          <div className="field">
            <label>{t('loginPasswordLabel')}</label>
            <input type="password" name="password" autoComplete="current-password" required placeholder="••••••••" value={form.password} onChange={handleChange} />
          </div>
          <div className="field-row">
            <span />
            <a href="#!">{t('loginForgot')}</a>
          </div>
          <button type="submit" className="btn btn-primary btn-block">{t('login')}</button>
        </form>

        <div className="divider-text">OR</div>

        <button type="button" className="btn btn-outline btn-block google-btn" onClick={handleGoogleLogin} disabled={googleLoading || !googleConfigured}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18Z"/>
            <path fill="#FBBC05" d="M3.97 10.71A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3.01-2.33Z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"/>
          </svg>
          {googleLoading ? '…' : googleConfigured ? 'Continue with Google' : 'Google sign-in needs setup'}
        </button>
        {!googleConfigured && <p className="text-muted" style={{ fontSize: 12, textAlign: 'center', marginBottom: 0 }}>Use email and password. Google sign-in is unavailable until a Firebase project is connected.</p>}
      </div>
    </div>
  )
}

export default Login
