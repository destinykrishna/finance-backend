const rateLimit = require('express-rate-limit')

// Global rate limiter - applies to all endpoints
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, 
  legacyHeaders: false, 
})

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: 'Too many authentication attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, 
})

// Moderate rate limiter for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 50, 
  message: 'Too many API requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = {
  globalLimiter,
  authLimiter,
  apiLimiter,
}
