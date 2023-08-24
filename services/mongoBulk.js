const mongoose = require("mongoose");
const Lab = require("../models/lab");
const Med = require("../models/med");

async function labBulkUpsert(dataArray) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bulkOperations = dataArray.map((data) => {
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

async function medBulkUpsert(dataArray) {
  const session = await mongoose.startSession();
  session.startTransaction();

  let labsInDb = await Lab.find({});
  try {
    const bulkOperations1 = dataArray.map((data) => {
      const {
        link,
        Distributeur_ou_fabriquant,
        similar,
        activeSubstance,
        ...updateData
      } = data;

      labsInDb.forEach((lab) => {
        if (lab.title === Distributeur_ou_fabriquant) {
          Distributeur_ou_fabriquant = lab._id;
        }
      });
      updateData.Distributeur_ou_fabriquant = Distributeur_ou_fabriquant;

      return {
        updateOne: {
          filter: { link },
          update: { $set: updateData },
          upsert: true,
        },
      };
    });

    await Med.bulkWrite(bulkOperations1, { session });
    let medsInDb = await Med.find({});

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
