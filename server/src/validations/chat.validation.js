const Joi = require("joi");

// ── Start / Get Chat ───────────────────────────────────────
const startChatSchema = Joi.object({
  listingId: Joi.string().hex().length(24).required().messages({
    "string.hex":    "Invalid listing ID",
    "string.length": "Invalid listing ID",
    "any.required":  "Listing ID is required",
  }),
  sellerId: Joi.string().hex().length(24).required().messages({
    "string.hex":    "Invalid seller ID",
    "string.length": "Invalid seller ID",
    "any.required":  "Seller ID is required",
  }),
});

// ── Send Message ───────────────────────────────────────────
const sendMessageSchema = Joi.object({
  content: Joi.string().trim().min(1).max(1000).required().messages({
    "string.min":   "Message cannot be empty",
    "string.max":   "Message cannot exceed 1000 characters",
    "any.required": "Message content is required",
  }),
});

module.exports = { startChatSchema, sendMessageSchema };
