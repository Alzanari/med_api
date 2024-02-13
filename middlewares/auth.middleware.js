const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const winston = require("../config/winston.config");

function authenticateToken(req, res, next) {
  const token = req.header("Authorization");
  if (!token) {
    const notFoundError = new Error("uthorization token not provided");
    winston.error(notFoundError.message);
    return res.status(401).json({ error: notFoundError.message });
  }
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      const notFoundError = new Error("Invalid token");
      winston.error(notFoundError.message);
      return res.status(401).json({ error: notFoundError.message });
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
    winston.error(notFoundError.message);
    return res.status(401).json({ error: errors.array() });
  }
  next();
};

module.exports = {
  authenticateToken,
  loginBodyRules,
  checkRules,
};
