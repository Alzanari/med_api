const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  refreshToken,
} = require("../controllers/auth");

// Define routes using the taskController methods
router.route("/").get(logout).post(login);
router.route("/refresh").get(refreshToken);
router.route("/register").post(register);

module.exports = router;
