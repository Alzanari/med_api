const {
  userByEmail,
  userByRefreshToken,
  insertUser,
  updateUserRefreshToken,
} = require("../services/userService");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email already exists
    const existingUser = await userByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create a new user
    const hash = await bcrypt.hash(password, process.env.SALT);
    await insertUser(email, hash);

    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Authentication failed" });
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
    res.status(500).json({ error: "Internal server error" });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    // Remove the refresh token from the database
    await updateUserRefreshToken(refreshToken);

    // Clear the token and refresh token cookie
    res.clearCookie("refreshToken");
    res.clearCookie("jwtToken");
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
    const user = await userByRefreshToken(refreshToken);
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
      res.cookie("jwtToken", accessToken, { httpOnly: true });
      res.status(200).json({ message: "New token sent successfully" });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
};
