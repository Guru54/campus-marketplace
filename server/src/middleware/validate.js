const AppError = require("../utils/AppError");

/**
 * Validation Middleware Factory
 * @param {import("joi").Schema} schema
 * @returns {import("express").RequestHandler}
 *
 * Usage:
 *   router.post("/register", validate(registerSchema), register);
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly:   false, // collect all errors at once
    stripUnknown: true,  // remove fields not in schema
  });

  if (error) {
    const message = error.details
      .map((detail) => detail.message)
      .join(", ");

    return next(new AppError(message, 400));
  }

  // Replace body with sanitized / coerced value
  req.body = value;
  next();
};

/**
 * Validation Middleware Factory — validates req.query
 * @param {import("joi").Schema} schema
 */
const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
    abortEarly:   false,
    stripUnknown: true,
  });

  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    return next(new AppError(message, 400));
  }

  req.query = value;
  next();
};

module.exports = validate;
module.exports.validateQuery = validateQuery;
