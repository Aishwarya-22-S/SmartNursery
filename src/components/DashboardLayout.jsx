import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Navbar from './Navbar.jsx'

// DashboardLayout - the logged-in shell: permanent sidebar (all pages,
// no Login/Registration, no numbers) + top navbar + one page rendered at
// a time in the content area via <Outlet />.
function DashboardLayout() {
  // useState - controls whether the sidebar is open on mobile (hamburger menu)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="dash-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dash-main">
        <Navbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />
        <div className="dash-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
