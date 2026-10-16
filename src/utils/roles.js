// Centralized role system - the single source of truth for role names,
// each role's "home" dashboard route, and access-control checks.
// Using constants instead of scattered string checks ('admin' typed out
// in five different files) keeps role logic consistent everywhere.

export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  CUSTOMER: 'customer',
}

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.STAFF]: 'Staff Member',
  [ROLES.CUSTOMER]: 'Customer',
}

const ROLE_HOME_PATH = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.STAFF]: '/staff',
  [ROLES.CUSTOMER]: '/customer-dashboard',
}

export function roleHomePath(role) {
  return ROLE_HOME_PATH[role] || '/login'
}

// canAccess - the single access-control rule used by RequireAuth.
// Admin has the highest level of access and can reach any route.
// Every other role must appear explicitly in the route's `roles` list.
// No `roles` list at all means "any logged-in role can view this page".
//
// strict=true opts a route OUT of the "admin can reach anything" rule -
// used for the one page (Notifications) that Admin is explicitly not
// supposed to have at all (section 1.H of the spec), so typing the URL
// directly as Admin still redirects instead of the usual admin override.
export function canAccess(role, allowedRoles, { strict = false } = {}) {
  if (!role) return false
  if (role === ROLES.ADMIN && !strict) return true
  if (!allowedRoles || allowedRoles.length === 0) return true
  return allowedRoles.includes(role)
}
