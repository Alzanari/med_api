const mongoose = require("mongoose");
const Lab = require("../models/lab");
const Med = require("../models/med");

async function labBulkUpsert(labArray) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bulkOperations = labArray.map((data) => {
      const { link, ...updateData } = data;
      return {
        updateOne: {
          filter: { link },
          update: { $set: updateData },
          upsert: true,
        },
      };
    });

    await Lab.bulkWrite(bulkOperations, { session });

    await session.commitTransaction();
  } catch (error) {
    console.error("Error performing lab bulk :", error);
    await session.abortTransaction();
  } finally {
    session.endSession();
  }
}

async function medBulkUpsert(medArray) {
  const session = await mongoose.startSession();
  session.startTransaction();

  // get labs from database
  let labsInDb = await Lab.find({});
  try {
    const bulkOperations1 = medArray.map((data) => {
      // split med object and seperate similar and activeSubstance from the rest of the data
      const {
        link,
        Distributeur_ou_fabriquant,
        similar,
        activeSubstance,
        ...updateData
      } = data;

      // match fab to lab title, if match found get id and add it to updatedata fab property
      labsInDb.forEach((lab) => {
        if (lab.title === Distributeur_ou_fabriquant) {
          updateData.Distributeur_ou_fabriquant = lab._id;
        }
      });

      // return the required structure for upsert
      return {
        updateOne: {
          filter: { link },
          update: { $set: updateData },
          upsert: true,
        },
      };
    });

    // upsert the new med data to the database sans similar and activeSubstance
    await Med.bulkWrite(bulkOperations1, { session });

    // get the updated med list from database
    let medsInDb = await Med.find({});

    // loop through the med list and get each similar and activeSubstance item it's _id in our database
    medsInDb.forEach((medDb) => {
      medDb.similar.forEach((sim) => {
        const foundObject = medsInDb.find((obj) => obj.link === sim.link);
        sim._id = foundObject._id;
      });
      medDb.activeSubstance.forEach((act) => {
        const foundObject = medsInDb.find((obj) => obj.link === act.link);
        act._id = foundObject._id;
      });
    });

    // return the required structure for similar and activeSubstance update
    const bulkOperations2 = medsInDb.map((data) => {
      const { _id, similar, activeSubstance } = data;
      return {
        updateOne: {
          filter: { _id },
          update: { $set: { similar, activeSubstance } },
          upsert: true,
        },
      };
    });

    // update similar and activeSubstance for each med in our databse
    await Med.bulkWrite(bulkOperations2, { session });

    await session.commitTransaction();
  } catch (error) {
    console.error("Error performing lab bulk :", error);
    await session.abortTransaction();
  } finally {
    session.endSession();
  }
}

module.exports = {
  labBulkUpsert,
  medBulkUpsert,
};
