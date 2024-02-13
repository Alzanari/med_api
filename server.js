const express = require("express");
const User = require("./models/user.model");
require("dotenv").config();
const mongoose = require("mongoose");
const { apiLimiter } = require("./middlewares/rateLimit.middleware");

const app = express();

app.use(express.json());

// Database section
dbCon().catch((err) => console.log(err));
async function dbCon() {
  await mongoose.connect(process.env.MONGODB_LINK);
  console.log("connected");
}

// add first user
mongoose.connection.on("open", async function () {
  // get all users
  const data = await User.find();
  if (data.length === 0) {
    await User({
      email: process.env.EMAIL_SEED,
      password: process.env.PASS_SEED,
    }).save();
  }
});

// Apply rate limiting middleware
app.use(apiLimiter);

// routes config
const authRouter = require("./routes/auth.route");
const labRouter = require("./routes/lab.route");
const medRouter = require("./routes/med.route");
const userRouter = require("./routes/user.route");
app.use("/auth", authRouter);
app.use("/lab", labRouter);
app.use("/med", medRouter);
app.use("/user", userRouter);

// Cron jobs section
const cronGetUpdates = require("./services/cron.service");
cronGetUpdates.start();

// const {
//   getLabs,
//   getMeds,
//   scrapList,
//   scrapLab,
//   scrapMed,
// } = require("./services/scrap.service");
// let x = async () => {
//   let test = await getMeds(
//     "https://medicament.ma/listing-des-medicaments/page/8/?lettre=Z"
//   );
//   console.log(test);
// };
// x();

// run server and listen on PORT
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`server is live on port ${PORT}`);
});
