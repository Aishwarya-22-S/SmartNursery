import { Outlet } from 'react-router-dom'
import PublicNavbar from './PublicNavbar.jsx'

// PublicLayout - the logged-out shell: just the public navbar plus whichever
// public page (Home, Plants, About, Contact, Login) is currently routed.
// Theme and font-size classes are applied one level up, in RootLayout.
function PublicLayout() {
  return (
    <>
      <PublicNavbar />
      <Outlet />
    </>
  )
}

export default PublicLayout
