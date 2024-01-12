const mongoose = require("mongoose");
const Lab = require("../models/lab");

const getAllLabs = async (req, res) => {
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

      const labs = await Lab.find()
        .sort(sort)
        .skip(skip)
        .limit(parseInt(queryLimit))
        .exec();

      const totalLabs = await Lab.countDocuments();

      res.json({
        data: labs,
        page: queryPage,
        totalPages: queryLimit == 0 ? 1 : Math.ceil(totalLabs / queryLimit),
        totalLabs: labs.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

const createLab = async (req, res) => {
  const { title, link } = req.body;
  try {
    const newLab = new Lab({ title, link });
    const savedLab = await newLab.save();
    res.status(201).json(savedLab);
  } catch (error) {
    res.status(400).json({ error: "Bad request" });
  }
};

const getLabById = async (req, res) => {
  const labId = req.params.id;
  try {
    const lab = await Lab.findById(labId);
    if (!lab) {
      return res.status(404).json({ error: "Lab not found" });
    }
    res.json(lab);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateLabById = async (req, res) => {
  const labId = req.params.id;
  try {
    const updatedLab = await Lab.findByIdAndUpdate(
      labId,
      { $set: req.body },
      { new: true }
    );
    if (!updatedLab) {
      return res.status(404).json({ error: "Lab not found" });
    }
    res.json(updatedLab);
  } catch (error) {
    res.status(400).json({ error: "Bad request" });
  }
};

const deleteLabById = async (req, res) => {
  const labId = req.params.id;
  try {
    const deletedLab = await Lab.findByIdAndRemove(labId);
    if (!deletedLab) {
      return res.status(404).json({ error: "Lab not found" });
    }
    res.json({ message: "Lab deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllLabs,
  getLabById,
  createLab,
  updateLabById,
  deleteLabById,
};
