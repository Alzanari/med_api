const mongoose = require("mongoose");

const LabSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: { unique: true },
    },
    link: {
      type: String,
      required: true,
      index: { unique: true },
    },
  },
  { strict: false, timestamps: true }
);

LabSchema.pre("find", function () {
  this.select("-_id -__v -createdAt -updatedAt");
});

const Lab = mongoose.model("Lab", LabSchema);

module.exports = Lab;
