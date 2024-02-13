const User = require("../models/user.model");
const winston = require("../config/winston.config");

const allUsers = async (sort, skip, queryLimit) => {
  try {
    const result = await User.find()
      .sort(sort)
      .skip(skip)
      .limit(parseInt(queryLimit))
      .exec();
    winston.info("Found users:", result);
    return result;
  } catch (error) {
    winston.error("Error finding users:", error);
  }
};

const userCount = async () => {
  try {
    const result = await User.countDocuments();
    winston.info("Total users:", result);
    return result;
  } catch (error) {
    winston.error("Error counnting users:", error);
  }
};

const userByEmail = async (email) => {
  try {
    const result = await User.findOne({ email });
    winston.info("Found user:", result);
    return result;
  } catch (error) {
    winston.error("Error finding user:", error);
  }
};

const userByRefreshToken = async (refreshToken) => {
  try {
    const result = await User.findOne({ refreshToken });
    winston.info("Found user:", result);
    return result;
  } catch (error) {
    winston.error("Error finding user:", error);
  }
};

const insertUser = async (email, password) => {
  try {
    const newUser = new User({ email, password });
    const result = await newUser.save();
    winston.info("Inserted user:", result);
    return result;
  } catch (error) {
    winston.error("Error inserting user:", error);
  }
};

const updateUser = async (email, userData) => {
  try {
    const result = await User.findOneAndUpdate(
      { email },
      { $set: userData },
      { new: true }
    );
    winston.info("Updated user:", result);
    return result;
  } catch (error) {
    winston.error("Error updating user:", error);
  }
};

const updateUserRefreshToken = async (refreshToken) => {
  try {
    const result = await User.findOneAndUpdate(
      { refreshToken },
      { refreshToken: null }
    );
    winston.info("Updated user:", result);
    return result;
  } catch (error) {
    winston.error("Error updating user:", error);
  }
};

const deleteUser = async (email) => {
  try {
    const result = await User.findOneAndDelete({ email });
    winston.info("Removed user:", result);
    return result;
  } catch (error) {
    winston.error("Error removing user:", error);
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
