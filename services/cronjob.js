var cron = require("node-cron");
const { getItems } = require("./scapper");
const { labBulkUpsert } = require("./mongoBulk");

// TODO:
// check the "Dernière mise à jour" in the footer and compare/store it in a json before running the scraper

module.exports = () => {
  cron.schedule("0 3 * * *", async () => {
    // console.log("everyday at 3AM");
  });
};
