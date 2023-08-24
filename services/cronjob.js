var cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");
const { getItems } = require("./scapper");
const { labBulkUpsert, medBulkUpsert } = require("./mongoBulk");

// TODO:
// check the "Dernière mise à jour" in the footer and compare/store it in a json before running the scraper

const settingsFilePath = path.join(__dirname, "config/settings.json");

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

module.exports = () => {
  cron.schedule("0 3 * * *", async () => {
    const html = await axios.get("https://medicament.ma/");
    const $ = cheerio.load(html.data);

    let latest = $("footer .meta").text();
    const settings = readSettings();
    if (!settings.updateDate || settings.updateDate != latest) {
      let labs = getItems("https://medicament.ma/laboratoires/", "lab");
      await labBulkUpsert(labs);
      let meds = getItems(
        "https://medicament.ma/listing-des-medicaments/",
        "med"
      );
      await medBulkUpsert(meds);
      let newSettings = {
        updateDate: latest,
      };
      saveSettings(newSettings);
    }
    // console.log("everyday at 3AM");
  });
};
