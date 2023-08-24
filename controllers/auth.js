const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    const token = jwt.sign({ email }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ email }, process.env.REFRESH_SECRET_KEY);

    // Store the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save();

    // Set the refresh token as a cookie
    res.cookie("refreshToken", refreshToken, { httpOnly: true });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const Logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    // Remove the refresh token from the database
    await User.findOneAndUpdate(
      { refreshToken: refreshToken },
      { refreshToken: null }
    );

    // Clear the refresh token cookie
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token not provided" });
  }

  try {
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Invalid refresh token" });
      }

      // Generate a new access token
      const accessToken = jwt.sign(
        { email: user.email },
        process.env.SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );
      res.status(200).json({ token: accessToken });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  Login,
  Logout,
  refreshToken,
};
