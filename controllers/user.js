const mongoose = require("mongoose");
const User = require("../models/user");

const getAllUsers = async (req, res) => {
  const { page, limit, orderField, order, ...filters } = req.query;
  const queryPage = page || 1;
  const queryLimit = limit || 10;
  const skip = (queryPage - 1) * queryLimit;

  try {
    const sort = {};
    if (orderField) {
      sort[orderField] = order === "desc" ? -1 : 1;
    }

    const users = await User.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(queryLimit))
      .exec();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const createUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const newUser = new User({ email, password });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ error: "Bad request" });
  }
};

const getUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateUserById = async (req, res) => {
  const userId = req.params.id;
  const { email, password } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { email, password } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: "Bad request" });
  }
};

const deleteUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    const deletedUser = await User.findByIdAndRemove(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUserById,
  deleteUserById,
};
