const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  createUser,
  getUserByEmail,
  updateUserByEmail,
  deleteUserByEmail,
} = require("../controllers/user.controller");

// Define routes using the userController methods
router.route("/").get(getAllUsers).post(createUser);

router
  .route("/:email")
  .get(getUserByEmail)
  .patch(updateUserByEmail)
  .delete(deleteUserByEmail);

module.exports = router;
