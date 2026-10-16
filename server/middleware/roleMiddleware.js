// authorize(...roles) - mirrors the frontend's canAccess() rule so the
// backend never relies solely on the frontend hiding a route. Admin always
// passes (highest privilege, same as roles.js on the frontend). Every
// other allowed role must be listed explicitly.
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401)
      return next(new Error('Not authenticated.'))
    }
    if (req.user.role === 'admin') return next()
    if (roles.length === 0) return next() // any logged-in role
    if (!roles.includes(req.user.role)) {
      res.status(403)
      return next(new Error('You do not have permission to perform this action.'))
    }
    next()
  }
}

module.exports = { authorize }
