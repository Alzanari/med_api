const express = require("express");
const router = express.Router();
const medController = require("../controllers/med");
const validator = require("../middlewares/input");

// Define routes using the medController methods
router
  .route("/")
  .get(validator.allMed, medController.getAllMeds)
  .post(medController.createMed);

router
  .route("/:id")
  .get(medController.getMedById)
  .patch(medController.updateMedById)
  .delete(medController.deleteMedById);

module.exports = router;
