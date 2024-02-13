const express = require("express");
const router = express.Router();
const {
  getAllMeds,
  getMedByMedId,
  createMed,
  updateMedByMedId,
  deleteMedByMedId,
} = require("../controllers/med.controller");
const validator = require("../middlewares/validation.middleware");

// Define routes using the medController methods
router.route("/").get(validator.allCheck, getAllMeds).post(createMed);

router
  .route("/:medId")
  .get(getMedByMedId)
  .patch(updateMedByMedId)
  .delete(deleteMedByMedId);

module.exports = router;
