const express = require('express')

const router = express.Router()
const { authMiddleware } = require('../middleware/auth.middleware')
const { authorize } = require('../middleware/rbac.middleware')
const { apiLimiter } = require('../middleware/rateLimit.middleware')
const { getTransactions, createTransaction, updateTransaction, deleteTransaction } = require('../controllers/transaction.controller')


router.get('/', authMiddleware, authorize('admin', 'analyst', 'viewer'), apiLimiter, getTransactions)
router.post('/', authMiddleware, authorize('admin', 'analyst'), apiLimiter, createTransaction)
router.put('/:id', authMiddleware, authorize('admin', 'analyst'), apiLimiter, updateTransaction)
router.delete('/:id', authMiddleware, authorize('admin'), apiLimiter, deleteTransaction)


module.exports = router