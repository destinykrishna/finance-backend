const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth.middleware')
const { authorize } = require('../middleware/rbac.middleware')
const { apiLimiter } = require('../middleware/rateLimit.middleware')
const { getUsers, updateUserRole, updateUserStatus } = require('../controllers/user.controller')

// Get all users (Admin only)
router.get('/', authMiddleware, authorize('admin'), apiLimiter, getUsers)

// Update user role (Admin only)
router.put('/:id/role', authMiddleware, authorize('admin'), apiLimiter, updateUserRole)

// Update user status (Admin only)
router.put('/:id/status', authMiddleware, authorize('admin'), apiLimiter, updateUserStatus)

module.exports = router
