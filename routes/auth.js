const express = require("express");
const router = express.Router();
const { Login, Logout, refreshToken } = require("../controllers/auth");

// Define routes using the taskController methods
router.route("/").get(Logout).post(Login);
router.route("/refresh").get(refreshToken);

module.exports = router;
