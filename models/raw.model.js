const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RawSchema = new mongoose.Schema(
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

RawSchema.pre("find", function () {
  this.select("-_id -__v -createdAt -updatedAt");
});

const Raw = mongoose.model("Raw", RawSchema);

module.exports = Raw;
