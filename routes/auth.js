const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

// Define routes using the taskController methods
router.route("/").get(authController.Logout).post(authController.Login);

module.exports = router;
