const Joi = require("joi");

const createUser = Joi.object()
  .keys({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8),
    confirm_password: Joi.ref("password"),
  })
  .with("password", "confirm_password");

const userEmail = Joi.object().keys({
  email: Joi.string().email().required(),
});

const userFields = Joi.object().keys({
  email: Joi.string().email().lowercase(),
  password: Joi.string().min(8),
});

const allUsers = allItems.keys(userFields);

module.exports = {
  createUser,
  userEmail,
  userFields,
  allUsers,
};
