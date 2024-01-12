const mongoose = require("mongoose");
const { matchedData } = require("express-validator");
const Med = require("../models/med");

const getAllMeds = async (req, res) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    const { page, limit, orderField, order } = matchedData(req);
    const queryPage = page || 1;
    const queryLimit = limit || 0;
    const skip = (queryPage - 1) * queryLimit;

    try {
      const sort = {};
      if (orderField) {
        sort[orderField] = order === "desc" ? -1 : 1;
      }

      const meds = await Med.find()
        .sort(sort)
        .skip(skip)
        .limit(parseInt(queryLimit))
        .exec();

      const totalMeds = await Med.countDocuments();

      res.json({
        data: meds,
        page: queryPage,
        totalPages: queryLimit == 0 ? 1 : Math.ceil(totalMeds / queryLimit),
        totalMeds: labs.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

const createMed = async (req, res) => {
  const { title, link } = req.body;
  try {
    const newMed = new Med({ title, link });
    const savedMed = await newMed.save();
    res.status(201).json(savedMed);
  } catch (error) {
    res.status(400).json({ error: "Bad request" });
  }
};

const getMedById = async (req, res) => {
  const medId = req.params.id;
  try {
    const med = await Med.findById(medId);
    if (!med) {
      return res.status(404).json({ error: "Med not found" });
    }
    res.json(med);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateMedById = async (req, res) => {
  const medId = req.params.id;
  try {
    const updatedMed = await Med.findByIdAndUpdate(
      medId,
      { $set: req.body },
      { new: true }
    );
    if (!updatedMed) {
      return res.status(404).json({ error: "Med not found" });
    }
    res.json(updatedMed);
  } catch (error) {
    res.status(400).json({ error: "Bad request" });
  }
};

const deleteMedById = async (req, res) => {
  const medId = req.params.id;
  try {
    const deletedMed = await Med.findByIdAndRemove(medId);
    if (!deletedMed) {
      return res.status(404).json({ error: "Med not found" });
    }
    res.json({ message: "Med deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllMeds,
  getMedById,
  createMed,
  updateMedById,
  deleteMedById,
};
