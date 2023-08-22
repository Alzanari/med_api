const mongoose = require("mongoose");

const LabSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
  },
  { strict: false }
);

const Lab = mongoose.model("Lab", LabSchema);

module.exports = Lab;
