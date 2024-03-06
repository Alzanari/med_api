const jwt = require("jsonwebtoken");
const winston = require("../config/winston.config");

module.exports = function () {
  return async function (req, res, next) {
    const authHeader = req.headers["Authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      const tokenNotFoundError = new Error("unauthorized! token not provided");
      winston.error(tokenNotFoundError.message);
      return res.status(401).json({ error: tokenNotFoundError.message });
    }
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        const invalidTokenError = new Error("Invalid token");
        winston.error(invalidTokenError.message);
        return res.status(401).json({ error: invalidTokenError.message });
      }
      req.user = decoded;
      next();
    });
  };
};
