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
    distributeur_ou_fabriquant: {
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
  { strict: false, timestamps: true }
);

MedSchema.virtual(
  "Sim",
  {
    ref: "Med",
    localField: "_id",
    foreignField: "similar",
    justOne: false,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

MedSchema.virtual(
  "ActSub",
  {
    ref: "Med",
    localField: "_id",
    foreignField: "activeSubstance",
    justOne: false,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

MedSchema.pre("find", function (next) {
  this.select("-_id -__v -createdAt -updatedAt");

  if (this.options._recursed) {
    return next();
  }
  this.populate([
    {
      path: "distributeur_ou_fabriquant",
      select: "title link -_id",
      options: { _recursed: true },
    },
    {
      path: "similar",
      select: "title link -_id",
      options: { _recursed: true },
    },
    {
      path: "activeSubstance",
      select: "title link -_id",
      options: { _recursed: true },
    },
  ]);
  next();
});

const Med = mongoose.model("Med", MedSchema);

module.exports = Med;
