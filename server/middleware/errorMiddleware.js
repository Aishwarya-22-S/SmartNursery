// notFound - catches any request that didn't match a route.
function notFound(req, res, next) {
  res.status(404)
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`))
}

// errorHandler - the single place that turns any thrown/forwarded error
// into a JSON response. Never leaks stack traces or internal details in
// production; always returns a meaningful HTTP status code.
function errorHandler(err, req, res, next) {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500
  let message = err.message || 'Server error'

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404
    message = 'Resource not found'
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ')
  }

  // Duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    statusCode = 400
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    message = `That ${field} is already in use.`
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  })
}

module.exports = { notFound, errorHandler }
