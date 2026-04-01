const Joi = require('joi');

const updateRoleSchema = Joi.object({
  role: Joi.string().valid('admin', 'analyst', 'viewer').required().messages({
    'any.only': 'Role must be admin, analyst, or viewer',
    'any.required': 'Role is required'
  })
})

const updateStatusSchema = Joi.object({
  isActive: Joi.boolean().required().messages({
    'any.required': 'isActive field is required'
  })
})

module.exports = { updateRoleSchema, updateStatusSchema }