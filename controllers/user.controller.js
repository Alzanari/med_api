const {
  allUsers,
  userCount,
  userByEmail,
  insertUser,
  updateUser,
  deleteUser,
} = require("../services/user.service");
const winston = require("../config/winston.config");

const getAllUsers = async (req, res) => {
  const { page, limit, orderField, order } = req.query;
  const queryPage = page || 1;
  const queryLimit = limit || 10;
  const skip = (queryPage - 1) * queryLimit;

  try {
    const sort = {};
    if (orderField) {
      sort[orderField] = order === "desc" ? -1 : 1;
    }

    const users = await allUsers(sort, skip, queryLimit);

    const totalUsers = await userCount();

    res.json({
      data: users,
      page: queryPage,
      totalPages: queryLimit == 0 ? 1 : Math.ceil(totalUsers / queryLimit),
      totalUsers: labs.length,
    });
  } catch (error) {
    winston.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const savedUser = await insertUser(email, password);
    res.status(201).json(savedUser);
  } catch (error) {
    winston.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserByEmail = async (req, res) => {
  const userEmail = req.params.email;
  try {
    const user = await userByEmail(userEmail);
    if (!user) {
      const notFoundError = new Error("User not found");
      winston.error(notFoundError.message);
      return res.status(404).json({ error: notFoundError.message });
    }
    res.json(user);
  } catch (error) {
    winston.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateUserByEmail = async (req, res) => {
  const userEmail = req.params.email;
  const { email, password } = req.body;
  try {
    const updatedUser = await updateUser(userEmail, { email, password });
    if (!updatedUser) {
      const notFoundError = new Error("User not found");
      winston.error(notFoundError.message);
      return res.status(404).json({ error: notFoundError.message });
    }
    res.json(updatedUser);
  } catch (error) {
    winston.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteUserByEmail = async (req, res) => {
  const userEmail = req.params.email;
  try {
    const deletedUser = await deleteUser(userEmail);
    if (!deletedUser) {
      const notFoundError = new Error("User not found");
      winston.error(notFoundError.message);
      return res.status(404).json({ error: notFoundError.message });
    }
    res.json({ message: "User deleted" });
  } catch (error) {
    winston.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getUserByEmail,
  updateUserByEmail,
  deleteUserByEmail,
};
