const cron = require("node-cron");

const { getRef, getLabs, getMeds } = require("./scrap.service");
const { allRaws, insertRaw } = require("./raw.service");

const winston = require("../config/winston.config");

// cron job is 0 3 * * * which means everyday at 3AM
const getUpdates = cron.schedule("0 3 * * *", async () => {
  winston.info("running Cronjob for data scrapping");

  // check the "Dernière mise à jour"/last update in the footer and compare/store it in a json before running the scraper
  const refWeb = await getRef("https://medicament.ma/");

  // read config file with the last update of the db
  const refDB = await allRaws({ date: -1 }, 0, 1);

  // if config is empty or config last update is different than current last update, scrap the new data
  if (!refDB || refDB != refWeb.ref) {
    winston.info("new data to fetch");

    // create raw document
    await insertRaw(refWeb.ref, refWeb.date);

    await getLabs("https://medicament.ma/laboratoires/", refWeb);
    await getMeds("https://medicament.ma/listing-des-medicaments/", refWeb);

    winston.info("data fetched and upserted");
  }
});

module.exports = getUpdates;
