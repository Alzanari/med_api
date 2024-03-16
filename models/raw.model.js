const mongoose = require("mongoose");

const rawSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      index: { unique: true },
    },
    ref: {
      type: Number,
      required: true,
      index: { unique: true },
    },
    raw: [Schema.Types.Mixed],
  },
  { timestamps: true }
);

const Raw = mongoose.model("Raw", rawSchema);

module.exports = Raw;
