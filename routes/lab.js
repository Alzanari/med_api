const express = require("express");
const router = express.Router();
const labController = require("../controllers/lab");

// Define routes using the labController methods
router.route("/").get(labController.getAllLabs).post(labController.createLab);

router
  .route("/:id")
  .get(labController.getLabById)
  .patch(labController.updateLabById)
  .delete(labController.deleteLabById);

module.exports = router;
