const mongoose = require("mongoose");
const Lab = require("../models/lab.model");
const Med = require("../models/med.model");
const winston = require("../config/winston.config");

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
    winston.error(`Error performing lab bulk: ${error}`);
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
    const bulkOperations = medArray.map((data) => {
      // split med object and seperate similar and activeSubstance from the rest of the data
      const {
        medId,
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
          filter: { medId },
          update: { $set: updateData },
          upsert: true,
        },
      };
    });

    // upsert the new med data to the database sans similar and activeSubstance
    await Med.bulkWrite(bulkOperations, { session });

    await session.commitTransaction();
  } catch (error) {
    winston.error(`Error performing med bulk: ${error}`);
    await session.abortTransaction();
  } finally {
    session.endSession();
  }
}

async function medSimActBulkUpsert(medArray) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // get the updated med list (_id and link fields) from database
    let medsInDb = await Med.find({}).select("link");
    let mapSimAct = [];
    // loop through the med list and get each similar and activeSubstance item it's _id in our database
    medArray.forEach((med) => {
      let medMap = { _id: "", similar: [], activeSubstance: [] };
      const foundId = medsInDb.find((obj) => obj.link === med.link);
      medMap._id = foundId._id;
      for (let i = 0; i < med.similar.length; i++) {
        const foundSim = medsInDb.find(
          (obj) => obj.link === med.similar[i].link
        );
        if (foundSim != void 0) {
          medMap.similar.push({ _id: foundSim._id });
        }
      }
      for (let i = 0; i < med.activeSubstance.length; i++) {
        const foundAct = medsInDb.find(
          (obj) => obj.link === med.activeSubstance[i].link
        );
        if (foundAct != void 0) {
          medMap.activeSubstance.push({ _id: foundAct._id });
        }
      }
      mapSimAct.push(medMap);
    });

    // return the required structure for similar and activeSubstance update
    const bulkOperations = mapSimAct.map((data) => {
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
    await Med.bulkWrite(bulkOperations, { session });

    await session.commitTransaction();
  } catch (error) {
    winston.error(`Error performing medSimAct bulk: ${error}`);
    await session.abortTransaction();
  } finally {
    session.endSession();
  }
}

module.exports = {
  labBulkUpsert,
  medBulkUpsert,
  medSimActBulkUpsert,
};
