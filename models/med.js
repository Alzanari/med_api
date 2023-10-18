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
      index: { unique: true },
    },
    medId: {
      type: Number,
      index: { unique: true },
    },
    Distributeur_ou_fabriquant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
    },
    similar: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Med",
      },
    ],
    activeSubstance: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Med",
      },
    ],
  },
  { strict: false }
);

MedSchema.virtual(
  "Sim",
  {
    ref: "Med",
    localField: "_id",
    foreignField: "similar",
    justOne: false,
  },
  { toJSON: { virtuals: true } }
);

MedSchema.virtual(
  "ActSub",
  {
    ref: "Med",
    localField: "_id",
    foreignField: "activeSubstance",
    justOne: false,
  },
  { toJSON: { virtuals: true } }
);

const Med = mongoose.model("Med", MedSchema);

module.exports = Med;
