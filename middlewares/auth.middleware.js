const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const winston = require("../config/winston.config");

function authenticateToken(req, res, next) {
  const token = req.header("Authorization");
  if (!token) {
    const tokenNotFoundError = new Error("uthorization token not provided");
    winston.error(tokenNotFoundError.message);
    return res.status(401).json({ error: tokenNotFoundError.message });
  }
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      const invalidTokenError = new Error("Invalid token");
      winston.error(invalidTokenError.message);
      return res.status(401).json({ error: invalidTokenError.message });
    }
    req.user = decoded;
    next();
  });
}

const loginBodyRules = [
  body("email").isEmail().withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const checkRules = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const notFoundError = new Error(errors.array());
    winston.error(notFoundError.stack);
    return res.status(401).json({ error: errors.array() });
  }
  next();
};

module.exports = {
  authenticateToken,
  loginBodyRules,
  checkRules,
};
