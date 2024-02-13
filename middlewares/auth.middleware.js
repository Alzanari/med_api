const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

function authenticateToken(req, res, next) {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ error: "Authorization token not provided" });
  }
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
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
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  authenticateToken,
  loginBodyRules,
  checkRules,
};
