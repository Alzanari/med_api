const fs = require("fs");

const readSettings = (path) => {
  try {
    const data = fs.readFileSync(path, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading settings:", error);
    return null;
  }
};

const saveSettings = (path, newSettings) => {
  try {
    const jsonData = JSON.stringify(newSettings, null, 2);
    fs.writeFileSync(path, jsonData, "utf8");
    console.log("Settings saved successfully.");
  } catch (error) {
    console.error("Error saving settings:", error);
  }
};

module.exports = {
  readSettings,
  saveSettings,
};
