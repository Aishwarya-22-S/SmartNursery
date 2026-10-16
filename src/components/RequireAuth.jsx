import { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import { canAccess } from '../utils/roles.js'

// RequireAuth - the ONE route-protection component used everywhere (there
// used to be a separate RoleBasedRoute component too - consolidated here
// to avoid duplicate authorization logic). Does two checks:
//   1. Authentication: is anyone logged in at all? If not -> /login.
//   2. Authorization: does this user's role have permission for this
//      specific route? If not -> /access-denied.
// This runs at the ROUTE level (not just hidden sidebar links), so typing
// a URL directly can never bypass it.
//
// Usage:
//   <RequireAuth><Profile /></RequireAuth>                        (any logged-in role)
//   <RequireAuth roles={['admin']}><Analytics /></RequireAuth>    (admin only)
//   <RequireAuth roles={['admin','staff']}><Inventory /></RequireAuth>
function RequireAuth({ children, roles, strict }) {
  // useContext - reads the login session flag and the current user's role
  const { isLoggedIn, user, authChecked } = useContext(AppContext)
  const location = useLocation()

  // A saved JWT is verified against the backend on app load (see
  // AppContext). Until that finishes, hold off on redirecting to /login -
  // otherwise a real, still-valid session would flash to the login page
  // for a moment on every refresh.
  if (!authChecked) {
    return null
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!canAccess(user?.role, roles, { strict })) {
    return <Navigate to="/access-denied" replace />
  }

  return children
}

export default RequireAuth
