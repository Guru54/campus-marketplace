const Joi = require("joi");

const CATEGORY  = ["BOOKS", "ELECTRONICS", "FURNITURE", "CYCLES", "SPORTS", "CLOTHING", "NOTES", "OTHERS"];
const CONDITION = ["NEW", "LIKE_NEW", "GOOD", "FAIR"];
const STATUS    = ["ACTIVE", "RESERVED", "SOLD", "EXPIRED"];

// ── Create Listing ─────────────────────────────────────────
const createListingSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required().messages({
    "string.min":   "Title must be at least 3 characters",
    "string.max":   "Title cannot exceed 100 characters",
    "any.required": "Title is required",
  }),

  description: Joi.string().trim().min(10).max(1000).required().messages({
    "string.min":   "Description must be at least 10 characters",
    "string.max":   "Description cannot exceed 1000 characters",
    "any.required": "Description is required",
  }),

  price: Joi.number().min(0).required().messages({
    "number.min":   "Price cannot be negative",
    "any.required": "Price is required",
  }),

  category: Joi.string().valid(...CATEGORY).required().messages({
    "any.only":     `Category must be one of: ${CATEGORY.join(", ")}`,
    "any.required": "Category is required",
  }),

  condition: Joi.string().valid(...CONDITION).required().messages({
    "any.only":     `Condition must be one of: ${CONDITION.join(", ")}`,
    "any.required": "Condition is required",
  }),

  isNegotiable: Joi.boolean().default(false),

  // Images are handled by multer — passed as URLs after upload
  images: Joi.array().items(Joi.string().uri()).max(5).default([]).messages({
    "array.max": "Maximum 5 images allowed",
  }),
});

// ── Update Listing ─────────────────────────────────────────
const updateListingSchema = Joi.object({
  title:        Joi.string().trim().min(3).max(100),
  description:  Joi.string().trim().min(10).max(1000),
  price:        Joi.number().min(0),
  category:     Joi.string().valid(...CATEGORY),
  condition:    Joi.string().valid(...CONDITION),
  isNegotiable: Joi.boolean(),
  status:       Joi.string().valid(...STATUS),
  images:       Joi.array().items(Joi.string().uri()).max(5),
}).min(1).messages({
  "object.min": "Provide at least one field to update",
});

// ── Query / Filters ────────────────────────────────────────
const listingQuerySchema = Joi.object({
  page:      Joi.number().integer().min(1).default(1),
  limit:     Joi.number().integer().min(1).max(50).default(10),
  category:  Joi.string().valid(...CATEGORY),
  condition: Joi.string().valid(...CONDITION),
  minPrice:  Joi.number().min(0),
  maxPrice:  Joi.number().min(0),
  search:    Joi.string().trim().max(100),
  sort:      Joi.string().valid("newest", "oldest", "price_asc", "price_desc").default("newest"),
});

module.exports = { createListingSchema, updateListingSchema, listingQuerySchema };
