const cron = require("node-cron");

const { getDbRef, getLabs, getMeds } = require("./scrap.service");

const path = require("path");
const { readSettings, saveSettings } = require("../utils/writeToJSON.util");

const winston = require("../config/winston.config");

// path to json config file
const settingsFilePath = path.join(
  __dirname,
  "..",
  "config",
  "cronRef.config.json"
);

// cron job is 0 3 * * * which means everyday at 3AM
const getUpdates = cron.schedule("0 3 * * *", async () => {
  winston.info("running Cronjob for data scrapping");

  // check the "Dernière mise à jour"/last update in the footer and compare/store it in a json before running the scraper
  const ref = await getDbRef("https://medicament.ma/");

  // read config file with the last update of the db
  const settings = readSettings(settingsFilePath);

  // if config is empty or config last update is different than current last update, scrap the new data
  if (!settings.updateDate || settings.updateDate != ref.latest) {
    winston.info("new data to fetch");

    await getLabs("https://medicament.ma/laboratoires/");
    await getMeds("https://medicament.ma/listing-des-medicaments/");

    winston.info("data fetched and upserted");

    // save the new db ref
    saveSettings(settingsFilePath, ref);
  }
});

module.exports = getUpdates;
