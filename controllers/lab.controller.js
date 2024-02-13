const { matchedData } = require("express-validator");
const {
  allLabs,
  labCount,
  labByTitle,
  insertLab,
  updateLab,
  deleteLab,
} = require("../services/lab.service");
const winston = require("../config/winston.config");

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

      const labs = await allLabs(sort, skip, queryLimit);

      const totalLabs = await labCount();

      res.json({
        data: labs,
        page: queryPage,
        totalPages: queryLimit == 0 ? 1 : Math.ceil(totalLabs / queryLimit),
        totalLabs: labs.length,
      });
    } catch (error) {
      winston.error(error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

const createLab = async (req, res) => {
  const { title, link } = req.body;
  try {
    const savedLab = await insertLab(title, link);
    res.status(201).json(savedLab);
  } catch (error) {
    winston.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getLabByTitle = async (req, res) => {
  const labTitle = req.params.title;
  try {
    const lab = await labByTitle(labTitle);
    if (!lab) {
      const notFoundError = new Error("Lab not found");
      winston.error(notFoundError.message);
      return res.status(404).json({ error: notFoundError.message });
    }
    res.json(lab);
  } catch (error) {
    winston.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateLabByTitle = async (req, res) => {
  const labTitle = req.params.title;
  try {
    const updatedLab = await updateLab(labTitle, req.body);
    if (!updatedLab) {
      const notFoundError = new Error("Lab not found");
      winston.error(notFoundError.message);
      return res.status(404).json({ error: notFoundError.message });
    }
    res.json(updatedLab);
  } catch (error) {
    winston.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteLabByTitle = async (req, res) => {
  const labTitle = req.params.title;
  try {
    const deletedLab = await deleteLab(labTitle);
    if (!deletedLab) {
      const notFoundError = new Error("Lab not found");
      winston.error(notFoundError.message);
      return res.status(404).json({ error: notFoundError.message });
    }
    res.json({ message: "Lab deleted" });
  } catch (error) {
    winston.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllLabs,
  getLabByTitle,
  createLab,
  updateLabByTitle,
  deleteLabByTitle,
};
