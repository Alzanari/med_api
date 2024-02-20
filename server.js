const express = require("express");
const User = require("./models/user.model");
require("dotenv").config();
const mongoose = require("mongoose");
const { apiLimiter } = require("./middlewares/rateLimit.middleware");
const winston = require("./config/winston.config");

const app = express();

app.use(express.json());

// error handling for uncaught and unhandled
process.on("uncaughtException", (error) => {
  winston.error(`Uncaught Exception: ${error.message}`);
  // Perform cleanup tasks if needed
  process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
  winston.error(
    `Unhandled Rejection at: ${promise}, reason: ${reason.message}`
  );
  // Perform cleanup tasks if needed
  process.exit(1);
});

// Apply rate limiting middleware
app.use(apiLimiter);

// Database section
dbCon().catch((err) => console.log(err));
async function dbCon() {
  await mongoose.connect(process.env.MONGODB_LINK);
  winston.info("connected to mongodb");
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

// routes config
const authRouter = require("./routes/auth.route");
const labRouter = require("./routes/lab.route");
const medRouter = require("./routes/med.route");
const userRouter = require("./routes/user.route");
app.use("/v1/auth", authRouter);
app.use("/v1/labs", labRouter);
app.use("/v1/meds", medRouter);
app.use("/v1/users", userRouter);

// Cron jobs section
const cronGetUpdates = require("./services/cron.service");
cronGetUpdates.start();

// run server and listen on PORT
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  winston.info(`server is live on port ${PORT}`);
});
