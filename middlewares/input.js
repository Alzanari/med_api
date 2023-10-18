const { check, validationResult } = require("express-validator");

exports.validateMed = [
  // Validate 'title' ADD WILDCARD
  check("title")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Title can not be empty!")
    .bail(),

  // Validate 'link' (optional)
  check("link").optional().isURL(),

  // Validate '_id' (optional)
  check("_id").optional().isString(),

  // Validate 'Présentation' (optional) ADD WILDCARD
  check("Présentation").optional().isString(),

  // Validate 'Grossesse' (optional)
  check("Grossesse").optional().isString().isIn(["non", "oui"]),

  // Validate 'Particularité' (optional)
  check("Particularité").optional().isString(),

  // Validate 'Risque_potentiel_de_dépendance_ou_d’abus' (optional)
  check("Risque_potentiel_de_dépendance_ou_d’abus")
    .optional()
    .isString()
    .equals("oui"),

  // Validate 'Lien_du_Produit' (optional)
  check("Lien_du_Produit").optional().isURL(),

  // Validate 'similar' (optional)
  check("similar").optional().isArray(),

  // Validate 'activeSubstance' (optional)
  check("activeSubstance").optional().isArray(),

  // Validate 'Boîte' (optional)
  check("Boîte").optional().isURL(),

  // Validate 'Indication(s)' (optional)
  check("Indication(s)").optional().isString(),

  // Validate 'Conservation' (optional)
  check("Conservation").optional().isString(),

  // Validate 'Base_de_remboursement_/_PPV' (optional)
  check("Base_de_remboursement_/_PPV").optional().isNumeric(),

  // Validate 'Prix_hospitalier' (optional)
  check("Prix_hospitalier").optional().isNumeric(),

  // Validate 'Substance_(s)_psychoactive_(s)' (optional)
  check("Substance_(s)_psychoactive_(s)").optional().isString().equals("oui"),

  // Validate 'Age_minimal_d'utilisation' (optional)
  check("Age_minimal_d'utilisation").optional().isString(),

  // Validate 'Classe_thérapeutique' (optional) ADD WILDCARD
  check("Classe_thérapeutique").optional().isString(),

  // Validate 'Notice_en_français' (optional)
  check("Notice_en_français").optional().isString(),

  // Validate 'medId' (optional)
  check("medId").optional().isInt(),

  // Validate 'Nature_du_Produit' (optional)
  check("Nature_du_Produit")
    .optional()
    .isString()
    .isIn(["complément alimentaire", "dispositif médical", "médicament"]),

  // Validate 'Remboursement' (optional)
  check("Remboursement").optional().isString().isIn(["oui", "non"]),

  // Validate 'Princeps' (optional)
  check("Princeps").optional().isString().equals("oui"),

  // Validate 'Allaitement' (optional)
  check("Allaitement").optional().isString().isIn(["oui", "non"]),

  // Validate 'Composition' (optional) ADD WILDCARD
  check("Composition").optional().isString(),

  // Validate 'Dosage' (optional)
  check("Dosage").optional().isString(),

  // Validate 'PPV' (optional)
  check("PPV").optional().isNumeric(),

  // Validate 'Posologies_et_mode_d'administration' (optional)
  check("Posologies_et_mode_d'administration").optional().isString(),

  // Validate 'Tiers_Payant' (optional)
  check("Tiers_Payant").optional().isString().isIn(["oui", "non"]),

  // Validate 'Code_ATC' (optional)
  check("Code_ATC").optional().isString(),

  // Validate 'Mises_en_garde' (optional)
  check("Mises_en_garde").optional().isString(),

  // Validate 'Statut' (optional)
  check("Statut").optional().isString().equals("statut"),

  // Validate 'Convention_de_Vienne' (optional)
  check("Convention_de_Vienne").optional().isString(),

  // Validate 'Effets_indésirable' (optional)
  check("Effets_indésirable").optional().isString(),

  // Validate 'Tableau' (optional)
  check("Tableau").optional().isString().isIn(["a", "aucun", "b", "c"]),

  // Validate 'Contres-indication(s)' (optional)
  check("Contres-indication(s)").optional().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    next();
  },
];
