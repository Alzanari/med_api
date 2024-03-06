const Joi = require("joi");
const { allItems } = require("./common.validator");

const medId = Joi.object().keys({
  medId: Joi.string().required(),
});

const fields = {
  statut: Joi.string().valid("Commercialisé"),
  conservation: Joi.string(),
  effets_indésirable: Joi.string(),
  base_de_remboursement_ppv: Joi.number(),
  link: Joi.string().uri(),
  prix_hospitalier: Joi.number(),
  title: Joi.string(),
  allaitement: Joi.string().valid(
    "Demander conseil à votre médecin",
    "Non",
    "Oui"
  ),
  substance_psychoactive: Joi.string().valid("Oui"),
  code_atc: Joi.string(),
  ppv: Joi.number(),
  grossesse: Joi.string().valid(
    "Demander conseil à votre médecin",
    "Non",
    "Oui"
  ),
  particularité: Joi.string(),
  mises_en_garde: Joi.string(),
  tiers_payant: Joi.string().valid("Non", "Oui"),
  notice_en_arabe: Joi.string().uri(),
  présentation: Joi.string(),
  mises_en_garde: Joi.string(),
  ppc: Joi.number(),
  convention_de_vienne: Joi.string().valid("Tableau III", "Tableau IV"),
  contres_indication: Joi.string(),
  boîte: Joi.string().uri(),
  dosage: Joi.array().items(Joi.string()),
  form: Joi.string(),
  type: Joi.string(),
  risque_potentiel_de_dépendance_ou_d__abus: Joi.string().valid("Oui"),
  posologies_et_mode_d__administration: Joi.string(),
  princeps: Joi.string().valid("Oui"),
  lien_du_produit: Joi.string().uri(),
  notice_en_français: Joi.string().uri(),
  nature_du_produit: Joi.string(),
  composition: Joi.array().items(Joi.string()),
  rcp: Joi.string().uri(),
  medId: Joi.number().integer().positive(),
  age_minimal_d__utilisation: Joi.string(),
  classe_thérapeutique: Joi.string(),
  remboursement: Joi.string().valid("Non", "Oui"),
  tableau: Joi.string().valid("A", "Aucun", "B", "C"),
  indication: Joi.string(),
};

const medFields = Joi.object().keys(fields);

const allMeds = allItems.keys(fields);

module.exports = {
  medId,
  medFields,
  allMeds,
};
