const express = require("express");
const router = express.Router();
const labController = require("../controllers/lab");

// Define routes using the taskController methods
router.get("/", labController.getAllLabs);
router.get("/:id", labController.getLabById);

module.exports = router;
