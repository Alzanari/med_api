const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");

// Define routes using the userController methods
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUserById)
  .patch(userController.updateUserById)
  .delete(userController.deleteUserById);

module.exports = router;
