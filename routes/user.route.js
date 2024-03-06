const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  createUser,
  getUserByEmail,
  updateUserByEmail,
  deleteUserByEmail,
} = require("../controllers/user.controller");
const Jwt = require("../middlewares/validator.middleware");
const Validator = require("../middlewares/validator.middleware");

// Define routes using the userController methods
router
  .route("/")
  .get(Jwt(), Validator("allItems", "query"), getAllUsers)
  .post(Jwt(), Validator("createUser", "body"), createUser);

router
  .route("/:email")
  .get(Jwt(), Validator("userEmail", "params"), getUserByEmail)
  .patch(
    Jwt(),
    Validator("userEmail", "params"),
    Validator("createUser", "body"),
    updateUserByEmail
  )
  .delete(Jwt(), Validator("userEmail", "params"), deleteUserByEmail);

module.exports = router;
