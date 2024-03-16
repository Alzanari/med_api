const {
  allRaws,
  rawCount,
  rawByRef,
  insertRaw,
  updateRaw,
  deleteRaw,
} = require("../services/raw.service");
const winston = require("../config/winston.config");

const getAllRaws = async (req, res) => {
  const { page, limit, orderField, order } = req.params;
  const queryPage = page || 1;
  const queryLimit = limit || 0;
  const skip = (queryPage - 1) * queryLimit;

  try {
    const sort = {};
    if (orderField) {
      sort[orderField] = order === "desc" ? -1 : 1;
    }

    const raws = await allRaws(sort, skip, queryLimit);

    const totalRaws = await rawCount();

    res.json({
      data: raws,
      page: queryPage,
      totalPages: queryLimit == 0 ? 1 : Math.ceil(totalRaws / queryLimit),
      totalRaws: raws.length,
    });
  } catch (error) {
    winston.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createRaw = async (req, res) => {
  const { ref, raw } = req.body;
  try {
    const savedRaw = await insertRaw(ref, raw);
    res.status(201).json(savedRaw);
  } catch (error) {
    winston.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getRawByRef = async (req, res) => {
  const rawRef = req.params.ref;
  try {
    const raw = await rawByRef(rawRef);
    if (!raw) {
      const notFoundError = new Error("Raw not found");
      winston.error(notFoundError.message);
      return res.status(404).json({ error: notFoundError.message });
    }
    res.json(raw);
  } catch (error) {
    winston.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateRawByRef = async (req, res) => {
  const rawRef = req.params.ref;
  try {
    const updatedRaw = await updateRaw(rawRef, req.body);
    if (!updatedRaw) {
      const notFoundError = new Error("Raw not found");
      winston.error(notFoundError.message);
      return res.status(404).json({ error: notFoundError.message });
    }
    res.json(updatedRaw);
  } catch (error) {
    winston.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteRawByRef = async (req, res) => {
  const rawRef = req.params.ref;
  try {
    const deletedRaw = await deleteRaw(rawRef);
    if (!deletedRaw) {
      const notFoundError = new Error("Raw not found");
      winston.error(notFoundError.message);
      return res.status(404).json({ error: notFoundError.message });
    }
    res.json({ message: "Raw deleted" });
  } catch (error) {
    winston.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllRaws,
  getRawByRef,
  createRaw,
  updateRawByRef,
  deleteRawByRef,
};
