const Joi = require("joi");

// ── Update Profile ─────────────────────────────────────────
const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(30).messages({
    "string.min": "First name must be at least 2 characters",
    "string.max": "First name must be at most 30 characters",
  }),

  lastName: Joi.string().trim().min(2).max(30).messages({
    "string.min": "Last name must be at least 2 characters",
    "string.max": "Last name must be at most 30 characters",
  }),

  // avatar comes from upload middleware as a URL
  avatar: Joi.string().uri().allow(""),
}).min(1).messages({
  "object.min": "Provide at least one field to update",
});

// ── Change Password ────────────────────────────────────────
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required",
  }),

  newPassword: Joi.string()
    .min(8)
    .max(32)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.min":          "New password must be at least 8 characters",
      "string.max":          "New password must be at most 32 characters",
      "string.pattern.base": "New password must contain uppercase, lowercase and a number",
      "any.required":        "New password is required",
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only":     "Passwords do not match",
      "any.required": "Please confirm your new password",
    }),
});

module.exports = { updateProfileSchema, changePasswordSchema };
