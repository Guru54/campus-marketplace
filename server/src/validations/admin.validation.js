const Joi = require("joi");

const listUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(50),
  college: Joi.string().hex().length(24),
  role: Joi.string().valid("STUDENT", "ADMIN"),
  isBanned: Joi.string().valid("true", "false"),
});

const banUserSchema = Joi.object({
  reason: Joi.string().trim().max(300).allow("").optional(),
});

const listListingsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(50),
  college: Joi.string().hex().length(24),
  status: Joi.string().valid("ACTIVE", "RESERVED", "SOLD", "EXPIRED"),
});

const auditLogQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(50),
  action: Joi.string(),
  userId: Joi.string().hex().length(24),
});

module.exports = {
  listUsersQuerySchema,
  banUserSchema,
  listListingsQuerySchema,
  auditLogQuerySchema,
};
