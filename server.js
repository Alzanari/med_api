const express = require("express");
require("dotenv").config();
const { getItems } = require("./services/scapper");
const mongoose = require("mongoose");
const { apiLimiter } = require("./middlewares/rateLimit");

const app = express();

app.use(express.json());

// Database section
// dbCon().catch((err) => console.log(err));
// async function dbCon() {
//   await mongoose.connect(process.env.MONGODB_LINK);
// }

// Routing section
// Apply rate limiting middleware

app.use(apiLimiter);

const authRouter = require("./routes/auth");
const labRouter = require("./routes/lab");
const medRouter = require("./routes/med");
const userRouter = require("./routes/user");
app.use("/auth", authRouter);
app.use("/lab", labRouter);
app.use("/med", medRouter);
app.use("/user", userRouter);

// Cron jobs section
// require("./service/cronjob")();
let func = async () => {
  let medData = await getItems(
    "https://medicament.ma/listing-des-medicaments/page/29/",
    "med"
  );
  console.log(medData);
  // let labData = await getItems("https://medicament.ma/laboratoires/", "lab");
  // console.log(labData);
};
func();

// run server and listen on PORT
const PORT = process.env.PORT || 3030;
app.listen(3030, () => {
  console.log(`server is live on port ${PORT}`);
});
