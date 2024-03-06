const Joi = require("joi");
const { allItems } = require("./common.validator");

const labTitle = Joi.object().keys({
  title: Joi.string().required(),
});

const labFields = Joi.object().keys({
  fax: Joi.array().items(Joi.string()),
  statut: Joi.string(),
  adresse_usine: Joi.string(),
  adresse: Joi.string(),
  téléphone: Joi.array().items(Joi.string()),
  title: Joi.string(),
  link: Joi.string().uri(),
  email: Joi.string(),
  siteweb: Joi.string().uri(),
  usine_fax: Joi.array().items(Joi.string()),
  usine_téléphone: Joi.array().items(Joi.string()),
});

const allLabs = allItems.keys(labFields);

module.exports = {
  labTitle,
  labFields,
  allLabs,
};
