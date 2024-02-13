const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

module.exports = {
  apiLimiter,
};
