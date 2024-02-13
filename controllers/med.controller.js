const { matchedData } = require("express-validator");
const {
  allMeds,
  medCount,
  medByMedid,
  insertMed,
  updateMed,
  deleteMed,
} = require("../services/med.service");

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

      const meds = await allMeds(sort, skip, queryLimit);

      const totalMeds = await medCount();

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
    const savedMed = await insertMed(title, link);
    res.status(201).json(savedMed);
  } catch (error) {
    res.status(400).json({ error: "Bad request" });
  }
};

const getMedByMedId = async (req, res) => {
  const medId = req.params.medId;
  try {
    const med = await medByMedid(medId);
    if (!med) {
      return res.status(404).json({ error: "Med not found" });
    }
    res.json(med);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateMedByMedId = async (req, res) => {
  const medId = req.params.medId;
  try {
    const updatedMed = await updateMed(medId, req.body);
    if (!updatedMed) {
      return res.status(404).json({ error: "Med not found" });
    }
    res.json(updatedMed);
  } catch (error) {
    res.status(400).json({ error: "Bad request" });
  }
};

const deleteMedByMedId = async (req, res) => {
  const medId = req.params.medId;
  try {
    const deletedMed = await deleteMed(medId);
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
  getMedByMedId,
  createMed,
  updateMedByMedId,
  deleteMedByMedId,
};