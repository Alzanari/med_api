const winston = require("winston");
const { combine, timestamp, simple, json } = winston.format;
const path = require("path");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  transports: [
    new winston.transports.Console({
      format: simple(),
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "..", "logs", "error.log"),
      level: "error",
      format: combine(timestamp(), json()),
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "..", "logs", "combined.log"),
      format: combine(timestamp(), json()),
    }),
  ],
});

module.exports = logger;
