const express = require("express");
const router = express.Router();
const {
  getAllLabs,
  getLabByTitle,
  createLab,
  updateLabByTitle,
  deleteLabByTitle,
} = require("../controllers/lab.controller");
const Jwt = require("../middlewares/jwt.middleware");
const Validator = require("../middlewares/validator.middleware");

// Define routes using the labController methods
router
  .route("/")
  .get(Validator("allItems", "query"), getAllLabs)
  .post(Jwt(), Validator("labFields", "body"), createLab);

router
  .route("/:title")
  .get(Validator("labTitle", "params"), getLabByTitle)
  .patch(
    Jwt(),
    Validator("labTitle", "params"),
    Validator("labFields", "body"),
    updateLabByTitle
  )
  .delete(Jwt(), Validator("labTitle", "params"), deleteLabByTitle);

module.exports = router;
