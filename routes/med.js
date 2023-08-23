const express = require("express");
const router = express.Router();
const medController = require("../controllers/med");

// Define routes using the medController methods
router.route("/").get(medController.getAllMeds).post(medController.createMed);

router
  .route("/:id")
  .get(medController.getMedById)
  .patch(medController.updateMedById)
  .delete(medController.deleteMedById);

module.exports = router;
