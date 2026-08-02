const helmet = require("helmet");
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

// ── Helmet ──────────────────────────────────────────────
const helmetMiddleware = helmet();

// ── Mongo Sanitize ──────────────────────────────────────
const sanitizeMiddleware = (req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      req.query[key] = mongoSanitize.sanitize({ v: req.query[key] }).v;
    }
  }
  next();
};

// ── Rate Limiters ──────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many requests. Please try again after 15 minutes.",
  },
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 5, 
  standardHeaders: true,
  legacyHeaders: false,
  // Wrap req.ip to ensure secure IPv6 subnet masking
  keyGenerator: (req) => req.body?.email?.toLowerCase() || ipKeyGenerator(req.ip),
  message: {
    status: "fail",
    message: "Too many OTP attempts. Please try again after 10 minutes.",
  },
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  helmetMiddleware,
  sanitizeMiddleware,
  authLimiter,
  otpLimiter,
  globalLimiter,
};
