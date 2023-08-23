const express = require("express");
const router = express.Router();
const medController = require("../controllers/med");

// Define routes using the taskController methods
router.get("/", medController.getAllMeds);
router.get("/:id", medController.getMedById);

module.exports = router;
