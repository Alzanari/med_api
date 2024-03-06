const Joi = require("joi");
const { allItems } = require("./common.validator");

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

const fields = {
  email: Joi.string().email().lowercase(),
  password: Joi.string().min(8),
  refreshToken: Joi.string(),
};
const userFields = Joi.object().keys(fields);

const allUsers = allItems.keys(fields);

module.exports = {
  createUser,
  userEmail,
  userFields,
  allUsers,
};
