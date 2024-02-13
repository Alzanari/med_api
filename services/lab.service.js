const Lab = require("../models/lab.model");
const winston = require("../config/winston.config");

const allLabs = async (sort, skip, queryLimit) => {
  try {
    const result = await Lab.find()
      .sort(sort)
      .skip(skip)
      .limit(parseInt(queryLimit))
      .exec();
    winston.info("Found labs:", result);
    return result;
  } catch (error) {
    winston.error("Error finding labs:", error);
  }
};

const labCount = async () => {
  try {
    const result = await Lab.countDocuments();
    winston.info("Total labs:", result);
    return result;
  } catch (error) {
    winston.error("Error counnting labs:", error);
  }
};

const labByTitle = async (title) => {
  try {
    const result = await Lab.findOne({ title });
    winston.info("Found lab:", result);
    return result;
  } catch (error) {
    winston.error("Error finding lab:", error);
  }
};

const insertLab = async (title, link) => {
  try {
    const newLab = new Lab({ title, link });
    const result = await newLab.save();
    winston.info("Inserted lab:", result);
    return result;
  } catch (error) {
    winston.error("Error inserting lab:", error);
  }
};

const updateLab = async (title, labData) => {
  try {
    const result = await Lab.findOneAndUpdate(
      { title },
      { $set: labData },
      { new: true }
    );
    winston.info("Updated lab:", result);
    return result;
  } catch (error) {
    winston.error("Error updating lab:", error);
  }
};

const deleteLab = async (title) => {
  try {
    const result = await Lab.findOneAndDelete({ title });
    winston.info("Removed lab:", result);
    return result;
  } catch (error) {
    winston.error("Error removing lab:", error);
  }
};

module.exports = {
  allLabs,
  labCount,
  labByTitle,
  insertLab,
  updateLab,
  deleteLab,
};
