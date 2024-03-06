const express = require("express");
const router = express.Router();
const {
  getAllMeds,
  getMedByMedId,
  createMed,
  updateMedByMedId,
  deleteMedByMedId,
} = require("../controllers/med.controller");
const Jwt = require("../middlewares/jwt.middleware");
const Validator = require("../middlewares/validator.middleware");

// Define routes using the medController methods
router
  .route("/")
  .get(Validator("allItems", "query"), getAllMeds)
  .post(Jwt(), Validator("", "body"), createMed);

router
  .route("/:medId")
  .get(Validator("medId", "params"), getMedByMedId)
  .patch(
    Jwt(),
    Validator("medId", "params"),
    // Validator("", "body"),
    updateMedByMedId
  )
  .delete(Jwt(), Validator("medId", "params"), deleteMedByMedId);

module.exports = router;
