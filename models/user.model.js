const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

UserSchema.pre("find", function () {
  this.select("-_id -__v -createdAt -updatedAt");
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
