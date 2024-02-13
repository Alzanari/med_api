const Med = require("../models/med.model");

const allMeds = async (sort, skip, queryLimit) => {
  try {
    const result = await Med.find()
      .populate({
        path: "Distributeur_ou_fabriquant",
        select: "title link -_medId",
      })
      .populate({
        path: "similar",
        select: "title link -_medId",
      })
      .populate({
        path: "activeSubstance",
        select: "title link -_medId",
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(queryLimit))
      .exec();
    console.log("Found meds:", result);
    return result;
  } catch (error) {
    console.error("Error finding meds:", error);
  }
};

const medCount = async () => {
  try {
    const result = await Med.countDocuments();
    console.log("Total meds:", result);
    return result;
  } catch (error) {
    console.error("Error counnting meds:", error);
  }
};

const medByMedid = async (medId) => {
  try {
    const result = await Med.findOne({ medId });
    console.log("Found med:", result);
    return result;
  } catch (error) {
    console.error("Error finding med:", error);
  }
};

const insertMed = async (title, link) => {
  try {
    const newMed = new Med({ title, link });
    const result = await newMed.save();
    console.log("Inserted med:", result);
    return result;
  } catch (error) {
    console.error("Error inserting med:", error);
  }
};

const updateMed = async (medId, medData) => {
  try {
    const result = await Med.findOneAndUpdate(
      { medId },
      { $set: medData },
      { new: true }
    );
    console.log("Updated med:", result);
    return result;
  } catch (error) {
    console.error("Error updating med:", error);
  }
};

const deleteMed = async (medId) => {
  try {
    const result = await Med.findOneAndDelete({ medId });
    console.log("Removed med:", result);
    return result;
  } catch (error) {
    console.error("Error removing med:", error);
  }
};

module.exports = {
  allMeds,
  medCount,
  medByMedid,
  insertMed,
  updateMed,
  deleteMed,
};
