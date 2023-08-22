const express = require("express");
const { getItems } = require("./service/scapper");
const fs = require("fs");
const { log } = require("console");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("home page is live");
});

// 0 0 3 * * *

// require("./service/cronjob")();

let func = async () => {
  let medData = await getItems(
    "https://medicament.ma/listing-des-medicaments/page/29/",
    "med"
  );
  let labData = await getItems("https://medicament.ma/laboratoires/", "lab");
};
func();

app.listen(3030, () => {
  console.log("server is live on port 3030");
});
