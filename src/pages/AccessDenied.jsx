import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import { roleHomePath } from '../utils/roles.js'

// AccessDenied - shown when a logged-in user's role does not have
// permission for the route they tried to open (typed directly in the URL
// bar - sidebar links are already filtered by role, so this only fires
// on a manual/forced attempt).
function AccessDenied() {
  const { user } = useContext(AppContext)
  const homePath = roleHomePath(user?.role)

  return (
    <div className="page-content" style={{ maxWidth: 460, margin: '60px auto' }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 'calc(56px * var(--font-scale, 1))' }}>🚫</div>
        <h2 className="mt-16">Access Denied</h2>
        <p className="text-muted mt-8 mb-24">
          Your account doesn't have permission to view this page.
        </p>
        <Link to={homePath} className="btn btn-primary">Back to My Dashboard</Link>
      </div>
    </div>
  )
}

export default AccessDenied
