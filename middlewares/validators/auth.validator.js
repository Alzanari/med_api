const Joi = require("joi");

const login = Joi.object().keys({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).required(),
});

module.exports = login;
