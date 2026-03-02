const Joi = require("joi");

// ── Register ───────────────────────────────────────────────
const registerSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(30)
    .required()
    .messages({
      "string.min":   "First name must be at least 2 characters",
      "string.max":   "First name must be at most 30 characters",
      "any.required": "First name is required",
    }),

  lastName: Joi.string()
    .trim()
    .min(2)
    .max(30)
    .required()
    .messages({
      "string.min":   "Last name must be at least 2 characters",
      "string.max":   "Last name must be at most 30 characters",
      "any.required": "Last name is required",
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      "string.email": "Please provide a valid email",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .min(8)
    .max(32)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.min":          "Password must be at least 8 characters",
      "string.max":          "Password must be at most 32 characters",
      "string.pattern.base": "Password must contain uppercase, lowercase and a number",
      "any.required":        "Password is required",
    }),

  collegeId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      "string.hex":    "Invalid college ID",
      "string.length": "Invalid college ID",
      "any.required":  "College is required",
    }),
});

// ── Verify OTP ─────────────────────────────────────────────
const verifyOTPSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      "string.email": "Please provide a valid email",
      "any.required": "Email is required",
    }),

  otp: Joi.string()
    .length(6)
    .pattern(/^\d+$/)
    .required()
    .messages({
      "string.length":       "OTP must be 6 digits",
      "string.pattern.base": "OTP must contain only numbers",
      "any.required":        "OTP is required",
    }),
});

// ── Login ──────────────────────────────────────────────────
const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      "string.email": "Please provide a valid email",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .required()
    .messages({
      "any.required": "Password is required",
    }),
});

module.exports = { registerSchema, verifyOTPSchema, loginSchema };
