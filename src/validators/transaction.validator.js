const Joi = require('joi')

const createTransactionSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be a positive number',
    'any.required': 'Amount is required'
  }),
  type: Joi.string().valid('income', 'expense').required().messages({
    'any.only': 'Type must be either income or expense',
    'any.required': 'Type is required'
  }),
  category: Joi.string().min(2).max(50).required().messages({
    'any.required': 'Category is required'
  }),
  date: Joi.date().iso().optional(),
  notes: Joi.string().max(500).optional().allow('')
})

const updateTransactionSchema = Joi.object({
  amount: Joi.number().positive().optional(),
  type: Joi.string().valid('income', 'expense').optional(),
  category: Joi.string().min(2).max(50).optional(),
  date: Joi.date().iso().optional(),
  notes: Joi.string().max(500).optional().allow('')
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
})

module.exports = { createTransactionSchema, updateTransactionSchema }