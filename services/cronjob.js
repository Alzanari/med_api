const cron = require("node-cron");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");
const { getLabs, getMeds } = require("./scapper");
const {
  labBulkUpsert,
  medBulkUpsert,
  medSimActBulkUpsert,
} = require("./mongoBulk");
const { readSettings, saveSettings } = require("../utils/writeToJSON");

// path to json config file
const settingsFilePath = path.join(__dirname, "..", "config", "settings.json");

// cron job is 0 3 * * * which means everyday at 3AM
const getUpdates = cron.schedule("0 3 * * *", async () => {
  console.log("running Cronjob for data scrapping");

  // check the "Dernière mise à jour"/last update in the footer and compare/store it in a json before running the scraper
  const html = await axios.get("https://medicament.ma/");
  const $ = cheerio.load(html.data);
  let latest = $("footer .meta").first().text();
  let ref = $("footer .meta").last().text();

  // read config file with the last update of the db
  const settings = readSettings(settingsFilePath);

  // if config is empty or config last update is different than current last update, scrap the new data
  if (!settings.updateDate || settings.updateDate != latest) {
    console.log("new data to fetch");

    let labs = await getLabs("https://medicament.ma/laboratoires/");
    await labBulkUpsert(labs);
    let meds = await getMeds("https://medicament.ma/listing-des-medicaments/");
    await medBulkUpsert(meds);
    await medSimActBulkUpsert(meds);
    console.log("data fetched and upserted");

    let newSettings = {
      updateDate: latest,
      updateRef: ref,
    };
    saveSettings(settingsFilePath, newSettings);
  }
});

module.exports = getUpdates;
