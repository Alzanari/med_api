const User = require("../models/user");
const mongoose = require("mongoose");

//create your array. i inserted only 1 object here
const users = [
  new User({
    email: process.env.EMAIL_SEED,
    password: process.env.PASS_SEED,
    refreshToken: "",
  }),
];
//connect mongoose
dbCon().catch((err) => console.log(err));
async function dbCon() {
  await mongoose.connect(process.env.MONGODB_LINK, { useNewUrlParser: true });
  console.log("connected");
}
//save your data. this is an async operation
//after you make sure you seeded all the products, disconnect automatically
users.map(async (p, index) => {
  await p.save((err, result) => {
    if (index === users.length - 1) {
      console.log("DONE!");
      mongoose.disconnect();
    }
  });
});
