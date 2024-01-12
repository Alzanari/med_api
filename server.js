const express = require("express");
const User = require("./models/user");
require("dotenv").config();
const mongoose = require("mongoose");
const { apiLimiter } = require("./middlewares/rateLimit");

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
const authRouter = require("./routes/auth");
const labRouter = require("./routes/lab");
const medRouter = require("./routes/med");
const userRouter = require("./routes/user");
app.use("/auth", authRouter);
app.use("/lab", labRouter);
app.use("/med", medRouter);
app.use("/user", userRouter);

// Cron jobs section
const cronGetUpdates = require("./services/cronjob");
cronGetUpdates.start();

// run server and listen on PORT
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`server is live on port ${PORT}`);
});
