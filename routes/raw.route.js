const express = require("express");
const router = express.Router();
const {
  getAllRaws,
  getRawByRef,
  createRaw,
  updateRawByRef,
  deleteRawByRef,
} = require("../controllers/raw.controller");
const Jwt = require("../middlewares/jwt.middleware");
const Validator = require("../middlewares/validator.middleware");

// Define routes using the rawController methods
router
  .route("/")
  .get(Validator("allItems", "query"), getAllRaws)
  .post(Jwt(), Validator("rawFields", "body"), createRaw);

router
  .route("/:ref")
  .get(Validator("rawRef", "params"), getRawByRef)
  .patch(
    Jwt(),
    Validator("rawRef", "params"),
    Validator("rawFields", "body"),
    updateRawByRef
  )
  .delete(Jwt(), Validator("rawRef", "params"), deleteRawByRef);

module.exports = router;
