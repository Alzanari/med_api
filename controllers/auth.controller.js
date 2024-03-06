const {
  userByEmail,
  userByRefreshToken,
  insertUser,
  resetUserRefreshToken,
} = require("../services/user.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const winston = require("../config/winston.config");

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email already exists
    const existingUser = await userByEmail(email);
    if (existingUser) {
      const notFoundError = new Error("Email already exists");
      winston.error(notFoundError.message);
      return res.status(400).json({ error: notFoundError.message });
    }

    // Create a new user
    const hash = await bcrypt.hash(password, process.env.SALT);
    await insertUser(email, hash);

    res.json({ message: "User registered successfully" });
  } catch (error) {
    winston.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      const notFoundError = new Error("Authentication failed");
      winston.error(notFoundError.message);
      return res.status(401).json({ error: notFoundError.message });
    }

    const token = jwt.sign({ email }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ email }, process.env.REFRESH_SECRET_KEY);

    // Store the refresh token in the database
    await updateUser(email, { refreshToken });

    // Set the token and refresh token as a cookie
    res.cookie("refreshToken", refreshToken, { httpOnly: true });
    res.cookie("jwtToken", token, { httpOnly: true });
    res.status(200).json({ message: "Authentication successful" });
  } catch (error) {
    winston.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    // Remove the refresh token from the database
    await resetUserRefreshToken(refreshToken);

    // Clear the token and refresh token cookie
    res.clearCookie("refreshToken");
    res.clearCookie("jwtToken");
    res.status(200).json({ message: "Logged out" });
  } catch (error) {
    winston.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    const notFoundError = new Error("Refresh token not provided");
    winston.error(notFoundError.message);
    return res.status(401).json({ error: notFoundError.message });
  }

  try {
    const user = await userByRefreshToken(refreshToken);
    if (!user) {
      const notFoundError = new Error("Invalid refresh token");
      winston.error(notFoundError.message);
      return res.status(401).json({ error: notFoundError.message });
    }

    jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err, decoded) => {
      if (err) {
        const notFoundError = new Error("Invalid refresh token");
        winston.error(notFoundError.message);
        return res.status(401).json({ error: notFoundError.message });
      }

      // Generate a new access token
      const accessToken = jwt.sign(
        { email: user.email },
        process.env.SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );
      res.cookie("jwtToken", accessToken, { httpOnly: true });
      res.status(200).json({ message: "New token sent successfully" });
    });
  } catch (error) {
    winston.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
};
