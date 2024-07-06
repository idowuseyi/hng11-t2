const Joi = require('joi');

const userSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().pattern(/^[0-9\-]+$/).optional(),
});

const orgSchema = Joi.object({
  name: Joi.string().min(1).required(),
  description: Joi.string().optional(),
});

module.exports = {
  userSchema,
  orgSchema
};
