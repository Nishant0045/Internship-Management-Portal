const { validationResult } = require('express-validator');

/** Return 400 with readable messages when express-validator chains fail */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const messages = errors.array().map((e) => e.msg);
  return res.status(400).json({ message: messages[0], errors: messages });
}

module.exports = validate;
