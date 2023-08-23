const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");

// Define routes using the taskController methods
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);

module.exports = router;
