const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

// Define routes using the taskController methods
router.get("/login", authController.Login);
router.get("/logout", authController.Logout);

module.exports = router;
