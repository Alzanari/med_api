const { param, validationResult } = require("express-validator");

exports.allCheck = [
  // Validate 'limit' (optional)
  param("limit").optional().isInt().isIn([0, 10, 25, 50]),

  // Validate 'page' (optional)
  param("page").optional().isInt({ min: 1 }),

  // Validate 'orderField' (optional)
  param("orderField").optional().isString(),

  // Validate 'order' (optional)
  param("order").optional().isString().isIn(["asc", "desc"]),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    next();
  },
];
