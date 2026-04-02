const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth.middleware')
const { authorize } = require('../middleware/rbac.middleware')
const { apiLimiter } = require('../middleware/rateLimit.middleware')
const { getSummary, getCategoryWise, getMonthlyTrends, getRecentActivity } = require('../controllers/dashboard.controller')

router.get('/summary', authMiddleware, authorize('admin', 'analyst', 'viewer'), apiLimiter, getSummary)
router.get('/category-wise', authMiddleware, authorize('admin', 'analyst'), apiLimiter, getCategoryWise)
router.get('/monthly-trends', authMiddleware, authorize('admin', 'analyst'), apiLimiter, getMonthlyTrends)
router.get('/recent-activity', authMiddleware, authorize('admin', 'analyst', 'viewer'), apiLimiter, getRecentActivity)

module.exports = router;
