const mongoose = require("mongoose");
const Med = require("../models/med");

const getAllMeds = async (req, res) => {
  try {
    const meds = await Med.find();
    res.json(meds);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
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
