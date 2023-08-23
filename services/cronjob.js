const scrapper = require("./scapper");
var cron = require("node-cron");

// 0 0 3 * * *

module.exports = () => {
  cron.schedule("0 3 * * *", () => {
    console.log("everyday at 3AM");
  });
};
