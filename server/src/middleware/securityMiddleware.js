const helmet        = require("helmet");
const rateLimit     = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

// ── Helmet ──────────────────────────────────────────────
// Sets secure HTTP headers (XSS, clickjacking, MIME sniffing, etc.)
const helmetMiddleware = helmet();

// ── Mongo Sanitize ──────────────────────────────────────
// Sanitize only req.body and req.params — skip req.query (getter-only in Express 5)
const sanitizeMiddleware = (req, res, next) => {
  if (req.body)   mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
};

// ── Rate Limiters ──────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000, // 15 minutes
  max:             10,              // max 10 attempts per window
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    status:  "fail",
    message: "Too many requests. Please try again after 15 minutes.",
  },
});

const otpLimiter = rateLimit({
  windowMs:        10 * 60 * 1000, // 10 minutes
  max:             5,               // max 5 OTP attempts per window
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    status:  "fail",
    message: "Too many OTP attempts. Please try again after 10 minutes.",
  },
});

module.exports = {
  helmetMiddleware,
  sanitizeMiddleware,
  authLimiter,
  otpLimiter,
};
