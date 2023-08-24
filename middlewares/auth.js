const mongoose = require("mongoose");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ error: "Authorization token not provided" });
  }
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
}

async function checkRefreshToken(req, res, next) {
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
      req.accessToken = accessToken;
      next();
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  authenticateToken,
  checkRefreshToken,
};
