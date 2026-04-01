const express = require('express')

const router = express.Router()
const {authMiddleware} = require('../middleware/auth.middleware')
const {authorize} = require('../middleware/rbac.middleware')
const {getTransactions, createTransaction, updateTransaction, deleteTransaction} = require('../controllers/transaction.controller')


router.get('/', authMiddleware, authorize('admin', 'analyst', 'viewer'), getTransactions)
router.post('/', authMiddleware, authorize('admin', 'analyst'), createTransaction)
router.put('/:id', authMiddleware, authorize('admin', 'analyst'), updateTransaction)
router.delete('/:id', authMiddleware, authorize('admin'), deleteTransaction)


module.exports = router