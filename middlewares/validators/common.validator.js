const Joi = require("joi");

const allItems = Joi.object().keys({
  limit: Joi.number().valid(0, 10, 25, 50),
  page: Joi.number().integer().positive(),
  order_by: Joi.string().when("order", {
    is: Joi.exist(),
    then: Joi.required(),
  }),
  order: Joi.string().valid("asc", "desc"),
});

const createItem = Joi.object().keys({
  title: Joi.string().email().required(),
  link: Joi.string().email().required(),
});

module.exports = { allItems, createItem };
