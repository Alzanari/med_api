const Raw = require("../models/raw.model");
const winston = require("../config/winston.config");

const allRaws = async (sort, skip, queryLimit) => {
  try {
    const result = await Raw.find()
      .sort(sort)
      .skip(skip)
      .limit(parseInt(queryLimit))
      .exec();
    // winston.info(`Found raws: ${result}`);
    return result;
  } catch (error) {
    winston.error(`Error finding raws: ${error}`);
  }
};

const rawCount = async () => {
  try {
    const result = await Raw.countDocuments();
    // winston.info(`Total raws: ${result}`);
    return result;
  } catch (error) {
    winston.error(`Error counnting raws: ${error}`);
  }
};

const rawByRef = async (ref) => {
  try {
    const result = await Raw.findOne({ ref });
    winston.info(`Found raw: ${result}`);
    return result;
  } catch (error) {
    winston.error(`Error finding raw: ${error}`);
  }
};

const insertRaw = async (ref, date) => {
  try {
    const newRaw = new Raw({ ref, date });
    const result = await newRaw.save();
    winston.info(`Inserted raw: ${result}`);
    return result;
  } catch (error) {
    winston.error(`Error inserting raw: ${error}`);
  }
};

const updateRaw = async (ref, raw) => {
  try {
    const result = await Raw.findOneAndUpdate(
      { ref },
      { $set: raw },
      { new: true }
    );
    winston.info(`Updated raw: ${result}`);
    return result;
  } catch (error) {
    winston.error(`Error updating raw: ${error}`);
  }
};

const deleteRaw = async (ref) => {
  try {
    const result = await Raw.findOneAndDelete({ ref });
    winston.info(`Removed raw: ${result}`);
    return result;
  } catch (error) {
    winston.error(`Error removing raw: ${error}`);
  }
};

module.exports = {
  allRaws,
  rawCount,
  rawByRef,
  insertRaw,
  updateRaw,
  deleteRaw,
};
