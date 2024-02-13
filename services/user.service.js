const User = require("../models/user.model");

const allUsers = async (sort, skip, queryLimit) => {
  try {
    const result = await User.find()
      .sort(sort)
      .skip(skip)
      .limit(parseInt(queryLimit))
      .exec();
    console.log("Found users:", result);
    return result;
  } catch (error) {
    console.error("Error finding users:", error);
  }
};

const userCount = async () => {
  try {
    const result = await User.countDocuments();
    console.log("Total users:", result);
    return result;
  } catch (error) {
    console.error("Error counnting users:", error);
  }
};

const userByEmail = async (email) => {
  try {
    const result = await User.findOne({ email });
    console.log("Found user:", result);
    return result;
  } catch (error) {
    console.error("Error finding user:", error);
  }
};

const userByRefreshToken = async (refreshToken) => {
  try {
    const result = await User.findOne({ refreshToken });
    console.log("Found user:", result);
    return result;
  } catch (error) {
    console.error("Error finding user:", error);
  }
};

const insertUser = async (email, password) => {
  try {
    const newUser = new User({ email, password });
    const result = await newUser.save();
    console.log("Inserted user:", result);
    return result;
  } catch (error) {
    console.error("Error inserting user:", error);
  }
};

const updateUser = async (email, userData) => {
  try {
    const result = await User.findOneAndUpdate(
      { email },
      { $set: userData },
      { new: true }
    );
    console.log("Updated user:", result);
    return result;
  } catch (error) {
    console.error("Error updating user:", error);
  }
};

const updateUserRefreshToken = async (refreshToken) => {
  try {
    const result = await User.findOneAndUpdate(
      { refreshToken },
      { refreshToken: null }
    );
    console.log("Updated user:", result);
    return result;
  } catch (error) {
    console.error("Error updating user:", error);
  }
};

const deleteUser = async (email) => {
  try {
    const result = await User.findOneAndDelete({ email });
    console.log("Removed user:", result);
    return result;
  } catch (error) {
    console.error("Error removing user:", error);
  }
};

module.exports = {
  allUsers,
  userCount,
  userByEmail,
  userByRefreshToken,
  insertUser,
  updateUser,
  updateUserRefreshToken,
  deleteUser,
};
