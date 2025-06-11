const Joi = require('joi');

const registerValidation = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().optional(),
});



module.exports = { registerValidation };