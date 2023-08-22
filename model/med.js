const mongoose = require("mongoose");

const MedSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    Distributeur_ou_fabriquant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
    },
    similar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Med",
    },
    activeSubstance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Med",
    },
  },
  { strict: false }
);

MedSchema.virtuals(
  "Similar",
  {
    ref: "Med",
    localField: "_id",
    similar: "similar",
    justOne: false,
  },
  { toJSON: { virtuals: true } }
);

MedSchema.virtuals(
  "ActiveSubstance",
  {
    ref: "Med",
    localField: "_id",
    similar: "activeSubstance",
    justOne: false,
  },
  { toJSON: { virtuals: true } }
);

const Med = mongoose.model("Med", MedSchema);

module.exports = Med;
