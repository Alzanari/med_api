const {
  allLabs,
  labCount,
  labByTitle,
  insertLab,
  updateLab,
  deleteLab,
} = require("../services/labService");

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
    res.status(400).json({ error: "Bad request" });
  }
};

const getLabByTitle = async (req, res) => {
  const labId = req.params.id;
  try {
    const lab = await labByTitle(labId);
    if (!lab) {
      return res.status(404).json({ error: "Lab not found" });
    }
    res.json(lab);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateLabByTitle = async (req, res) => {
  const labId = req.params.id;
  try {
    const updatedLab = await updateLab(labId, req.body);
    if (!updatedLab) {
      return res.status(404).json({ error: "Lab not found" });
    }
    res.json(updatedLab);
  } catch (error) {
    res.status(400).json({ error: "Bad request" });
  }
};

const deleteLabByTitle = async (req, res) => {
  const labId = req.params.id;
  try {
    const deletedLab = await deleteLab(labId);
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
  getLabByTitle,
  createLab,
  updateLabByTitle,
  deleteLabByTitle,
};
