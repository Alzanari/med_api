const express = require("express");
const { getItems } = require("./services/scapper");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

// Database section
// dbCon().catch((err) => console.log(err));
// async function dbCon() {
//   await mongoose.connect(process.env.MONGODB_LINK);
// }

// Routing section
const authRouter = require("./routes/auth");
const labRouter = require("./routes/lab");
const medRouter = require("./routes/med");
const userRouter = require("./routes/user");

// Use the taskRouter for /tasks routes
app.use("/auth", authRouter);
app.use("/lab", labRouter);
app.use("/med", medRouter);
app.use("/user", userRouter);

// Cron jobs section
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

// run server and listen on PORT
const PORT = process.env.PORT || 3030;
app.listen(3030, () => {
  console.log(`server is live on port ${PORT}`);
});
