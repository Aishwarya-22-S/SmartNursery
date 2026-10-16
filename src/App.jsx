import { Routes, Route } from 'react-router-dom'

import RootLayout from './components/RootLayout.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import { ROLES } from './utils/roles.js'

import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Login from './pages/Login.jsx'
import Profile from './pages/Profile.jsx'
import AccessDenied from './pages/AccessDenied.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import StaffDashboard from './pages/StaffDashboard.jsx'
import CustomerDashboard from './pages/CustomerDashboard.jsx'
import PlantCatalog from './pages/PlantCatalog.jsx'
import PlantDetails from './pages/PlantDetails.jsx'
import DiseaseDetection from './pages/DiseaseDetection.jsx'
import PlantHealth from './pages/PlantHealth.jsx'
import PlantCareGuide from './pages/PlantCareGuide.jsx'
import Inventory from './pages/Inventory.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderTracking from './pages/OrderTracking.jsx'
import OrderHistory from './pages/OrderHistory.jsx'
import PaymentVerification from './pages/PaymentVerification.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Notifications from './pages/Notifications.jsx'
import Chatbot from './pages/Chatbot.jsx'
import IoTDashboard from './pages/IoTDashboard.jsx'
import Analytics from './pages/Analytics.jsx'

// RootLayout decides the chrome (public navbar vs full dashboard sidebar)
// based on login state. Public pages (Home, Plants, Plant Details, About,
// Contact, Login) are open to everyone.
//
// Every other page is wrapped in RequireAuth:
//   - no `roles` prop           -> any logged-in user
//   - roles={['admin']}         -> admin only
//   - roles={['admin','staff']} -> admin + staff (customer blocked)
// Admin can always reach every route (see utils/roles.js canAccess()).
// A logged-in user whose role isn't allowed is redirected to /access-denied
// - enforced at the ROUTE level, not just by hiding sidebar links, so
// typing the URL directly can never bypass it.
function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* Public pages - accessible before login */}
        <Route path="/" element={<Home />} />
        <Route path="/plants" element={<PlantCatalog />} />
        <Route path="/plants/:id" element={<PlantDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/access-denied" element={<AccessDenied />} />

        {/* Any logged-in role */}
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/disease-detection" element={<RequireAuth roles={[ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER]}><DiseaseDetection /></RequireAuth>} />
        <Route path="/plant-health" element={<RequireAuth roles={[ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER]}><PlantHealth /></RequireAuth>} />
        {/* Staff + Customer only - Admin has no Notifications module at all
            (section 1.H of the spec), so this route uses `strict` to opt
            out of the usual "Admin can reach any route" override. */}
        <Route path="/notifications" element={<RequireAuth roles={[ROLES.STAFF, ROLES.CUSTOMER]} strict><Notifications /></RequireAuth>} />

        {/* Role-specific dashboards */}
        <Route path="/admin" element={<RequireAuth roles={[ROLES.ADMIN]}><AdminDashboard /></RequireAuth>} />
        <Route path="/staff" element={<RequireAuth roles={[ROLES.ADMIN, ROLES.STAFF]}><StaffDashboard /></RequireAuth>} />
        <Route path="/customer-dashboard" element={<RequireAuth roles={[ROLES.CUSTOMER]}><CustomerDashboard /></RequireAuth>} />

        {/* Admin + Staff inventory management; customers remain blocked. */}
        <Route path="/inventory" element={<RequireAuth roles={[ROLES.ADMIN, ROLES.STAFF]}><Inventory /></RequireAuth>} />
        <Route path="/iot" element={<RequireAuth roles={[ROLES.ADMIN]}><IoTDashboard /></RequireAuth>} />
        <Route path="/analytics" element={<RequireAuth roles={[ROLES.ADMIN]}><Analytics /></RequireAuth>} />

        {/* Admin + Staff only - order/payment operations, never the customer checkout UI */}
        <Route path="/payment-verification" element={<RequireAuth roles={[ROLES.ADMIN, ROLES.STAFF]}><PaymentVerification /></RequireAuth>} />
        <Route path="/order-tracking" element={<RequireAuth roles={[ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER]}><OrderTracking /></RequireAuth>} />

        {/* Customer only - shopping/checkout never appears in Admin or Staff */}
        <Route path="/care-guide" element={<RequireAuth roles={[ROLES.CUSTOMER]}><PlantCareGuide /></RequireAuth>} />
        <Route path="/cart" element={<RequireAuth roles={[ROLES.CUSTOMER]}><Cart /></RequireAuth>} />
        <Route path="/checkout" element={<RequireAuth roles={[ROLES.CUSTOMER]}><Checkout /></RequireAuth>} />
        <Route path="/order-history" element={<RequireAuth roles={[ROLES.CUSTOMER]}><OrderHistory /></RequireAuth>} />
        <Route path="/wishlist" element={<RequireAuth roles={[ROLES.CUSTOMER]}><Wishlist /></RequireAuth>} />
        <Route path="/chatbot" element={<RequireAuth roles={[ROLES.CUSTOMER]}><Chatbot /></RequireAuth>} />
      </Route>
    </Routes>
  )
}

export default App
