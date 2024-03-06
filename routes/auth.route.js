const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  refreshToken,
} = require("../controllers/auth.controller");
const Jwt = require("../middlewares/jwt.middleware");
const Validator = require("../middlewares/validator.middleware");

// Define routes using the taskController methods
router.route("/").get(Jwt(), logout).post(Validator("login", "body"), login);
router.route("/refresh").get(Jwt(), refreshToken);
router.route("/register").post(Validator("createUser", "body"), register);

module.exports = router;
