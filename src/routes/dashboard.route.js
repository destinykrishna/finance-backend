const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { getSummary, getCategoryWise, getMonthlyTrends, getRecentActivity } = require('../controllers/dashboardController');

router.get('/summary', authMiddleware, authorize('admin', 'analyst', 'viewer'), getSummary);
router.get('/category-wise', authMiddleware, authorize('admin', 'analyst'), getCategoryWise);
router.get('/monthly-trends', authMiddleware, authorize('admin', 'analyst'), getMonthlyTrends);
router.get('/recent-activity', authMiddleware, authorize('admin', 'analyst', 'viewer'), getRecentActivity);

module.exports = router;
