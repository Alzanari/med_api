const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");
const { getLabs, getMeds } = require("./scapper");
const {
  labBulkUpsert,
  medBulkUpsert,
  medSimActBulkUpsert,
} = require("./mongoBulk");

// cron job is 0 3 * * * which means everyday at 3AM
const getUpdates = cron.schedule("0 3 * * *", async () => {
  console.log("running Cronjob for data scrapping");
  // check the "Dernière mise à jour"/last update in the footer and compare/store it in a json before running the scraper
  const html = await axios.get("https://medicament.ma/");
  const $ = cheerio.load(html.data);
  let latest = $("footer .meta").first().text();
  let ref = $("footer .meta").last().text();

  // read config file with the last update of the db
  const settings = readSettings();

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
    saveSettings(newSettings);
  }
});

const settingsFilePath = path.join(__dirname, "..", "config", "settings.json");

const readSettings = () => {
  try {
    const data = fs.readFileSync(settingsFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading settings:", error);
    return null;
  }
};

const saveSettings = (newSettings) => {
  try {
    const jsonData = JSON.stringify(newSettings, null, 2);
    fs.writeFileSync(settingsFilePath, jsonData, "utf8");
    console.log("Settings saved successfully.");
  } catch (error) {
    console.error("Error saving settings:", error);
  }
};

module.exports = getUpdates;
