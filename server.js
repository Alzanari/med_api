const express = require("express");
const { getItems } = require("./service/scapper");
const mongoose = require("mongoose");
const fs = require("fs");
const { log } = require("console");

const app = express();

app.use(express.json());

// dbCon().catch((err) => console.log(err));
// async function dbCon() {
//   await mongoose.connect(process.env.MONGODB_LINK);
// }

app.get("/", (req, res) => {
  res.send("home page is live");
});

// require("./service/cronjob")();

let func = async () => {
  // let medData = await getItems(
  //   "https://medicament.ma/listing-des-medicaments/page/29/",
  //   "med"
  // );
  let labData = await getItems("https://medicament.ma/laboratoires/", "lab");
  console.log(labData);
};
func();

app.listen(3030, () => {
  console.log("server is live on port 3030");
});
