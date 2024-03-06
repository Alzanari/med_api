const Joi = require("joi");
const Validators = require("./validators");

module.exports = function (validator, type) {
  //! If validator is not exist, throw err
  if (!Validators.hasOwnProperty(validator))
    throw new Error(`'${validator}' validator is not exist`);

  return async function (req, res, next) {
    try {
      if (type == "body") {
        const validated = await Validators[validator].validateAsync(req.body);
        req.body = validated;
      }
      if (type == "params") {
        const validated = await Validators[validator].validateAsync(req.params);
        req.params = validated;
      }
      if (type == "query") {
        const validated = await Validators[validator].validateAsync(req.query);
        req.query = validated;
      }
      next();
    } catch (err) {
      //* Pass err to next
      //! If validation error occurs call next with HTTP 422. Otherwise HTTP 500
      if (err.isJoi) return res.status(422).json({ error: err.message });
      return res.status(500);
    }
  };
};
