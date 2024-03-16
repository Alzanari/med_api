const fs = require("fs");
const winston = require("../config/winston.config");

const readSettings = (path) => {
  try {
    const data = fs.readFileSync(path, "utf8");
    return JSON.parse(data);
  } catch (error) {
    winston.error(`Error reading settings: ${error}`);
    return null;
  }
};

const saveSettings = (path, data, message) => {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(path, jsonData, "utf8");
    let log = message ?? `JSON saved successfully to: ${path}`;
    winston.info(log);
  } catch (error) {
    winston.error(`Error saving settings: ${error}`);
  }
};

module.exports = {
  readSettings,
  saveSettings,
};
