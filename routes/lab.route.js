const express = require("express");
const router = express.Router();
const {
  getAllLabs,
  getLabByTitle,
  createLab,
  updateLabByTitle,
  deleteLabByTitle,
} = require("../controllers/lab.controller");
const { allCheck } = require("../middlewares/validation.middleware");

// Define routes using the labController methods
router.route("/").get(allCheck, getAllLabs).post(createLab);

router
  .route("/:title")
  .get(getLabByTitle)
  .patch(updateLabByTitle)
  .delete(deleteLabByTitle);

module.exports = router;
