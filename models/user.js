const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: { unique: true },
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: String,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
