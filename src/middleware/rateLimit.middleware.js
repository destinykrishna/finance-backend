const rateLimit = require('express-rate-limit')

// Skip rate limiting in test environment
const skipRateLimit = process.env.NODE_ENV === 'test' ? () => true : () => false

// Global rate limiter - applies to all endpoints
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, 
  legacyHeaders: false,
  skip: skipRateLimit,
})

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: 'Too many authentication attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skip: skipRateLimit,
})

// Moderate rate limiter for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 50, 
  message: 'Too many API requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimit,
})

module.exports = {
  globalLimiter,
  authLimiter,
  apiLimiter,
}
