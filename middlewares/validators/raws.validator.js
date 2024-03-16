const Joi = require("joi");
const { allItems } = require("./common.validator");

const rawRef = Joi.object().keys({
  ref: Joi.number().integer().positive(),
});

let fields = {
  date: Joi.date(),
  ref: Joi.number().integer().positive(),
  raw: Joi.array().items(Joi.object()),
};

const rawFields = Joi.object().keys(fields);

const allRaws = allItems.keys(fields);

module.exports = {
  rawRef,
  rawFields,
  allRaws,
};
