import { api, setToken } from './api.js'
import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

// ============================================================
// REAL BACKEND AUTHENTICATION
// ============================================================
// This used to look up a hard-coded DEMO_ACCOUNTS array on the frontend.
// It now calls the Express/MongoDB backend - the only place a role is
// decided is server-side (server/controllers/authController.js), so
// nothing on the login form can let a user pick their own role.
export async function authenticate(email, password) {
  const data = await api.post('/auth/login', { email, password })
  setToken(data.token)
  return data.user
}

export async function register(name, email, password, phone) {
  const data = await api.post('/auth/register', { name, email, password, phone })
  setToken(data.token)
  return data.user
}

// restoreSession - called on app load if a token is already saved, to
// confirm it's still valid and fetch the current user (handles a role
// change or account suspension taking effect without waiting for login).
export async function restoreSession() {
  const data = await api.get('/auth/me')
  return data.user
}

export async function logoutOnServer() {
  try {
    await api.post('/auth/logout')
  } catch {
    // Logout should never block the client-side logout from proceeding.
  }
}

// ============================================================
// GOOGLE SIGN-IN (Firebase Authentication)
// ============================================================
// Firebase verifies the Google identity; our backend then issues the app's
// own JWT session. Fill the VITE_FIREBASE_* values in .env.local and enable
// Google in Firebase Authentication before using this feature.
const REQUIRED_FIREBASE_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

export function isGoogleAuthConfigured() {
  return REQUIRED_FIREBASE_VARS.every((key) => Boolean(import.meta.env[key]?.trim()))
}

export async function signInWithGoogle() {
  if (!isGoogleAuthConfigured()) {
    throw new Error(
      'Google sign-in needs Firebase web app settings. Copy the six VITE_FIREBASE_* values from your Firebase project into .env.local, then restart the frontend.'
    )
  }

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }

  try {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const googleUser = result.user

    // Upsert this Google identity into our own backend and get a real JWT
    // session back. New Google sign-ins are always onboarded as
    // customers server-side - never chosen by the caller.
    const data = await api.post('/auth/google', {
      name: googleUser.displayName || 'Google User',
      email: googleUser.email,
      phone: googleUser.phoneNumber || '',
    })
    setToken(data.token)
    return data.user
  } catch (err) {
    if (err?.code === 'auth/operation-not-allowed') {
      throw new Error('Google sign-in is disabled in Firebase. Enable Google under Firebase Console → Authentication → Sign-in method.')
    }
    if (err?.code === 'auth/unauthorized-domain') {
      throw new Error('This website domain is not authorized for Firebase sign-in. Add it under Firebase Console → Authentication → Settings → Authorized domains.')
    }
    if (err?.code === 'auth/popup-blocked') {
      throw new Error('The browser blocked the Google sign-in popup. Allow popups for this site and try again.')
    }
    throw new Error(err?.message || 'Google sign-in failed. Please try again.')
  }
}
