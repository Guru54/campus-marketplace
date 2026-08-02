const AppError = require("../utils/AppError");

// ── Mongoose / JWT error converters ───────────────────────────
const handleCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} already exists`, 400);
};

const handleValidationError = (err) => {
  const message = Object.values(err.errors)
    .map((e) => e.message)
    .join(", ");
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please login again.", 401);
const handleJWTExpired = () =>
  new AppError("Session expired. Please login again.", 401);
const handleJSONParseError = () => new AppError("Invalid JSON payload.", 400);

// ── Sender ─────────────────────────────────────────────────────
const sendError = (err, res) => {
  if (err.isOperational) {
    // Known / expected error → tell client
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Unknown / programmer error → hide details
  console.error("💥 UNEXPECTED ERROR:", err);
  return res.status(500).json({
    status: "error",
    message: "Something went wrong. Please try again later.",
  });
};

// ── Global Error Handler ────────────────────────────────────────
// Must have 4 params so Express recognises it as an error handler
const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Clone so we don't mutate the original
  let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
  error.message = err.message;
  error.stack = err.stack;

  if (error.name === "CastError") {
    error = handleCastError(error);
  } else if (error.code === 11000) {
    error = handleDuplicateKey(error);
  } else if (error.name === "ValidationError") {
    error = handleValidationError(error);
  } else if (error.name === "JsonWebTokenError") {
    error = handleJWTError();
  } else if (error.name === "TokenExpiredError") {
    error = handleJWTExpired();
  } else if (error.type === "entity.parse.failed") {
    error = handleJSONParseError();
  }

  // Capture exception in Sentry if available (do not crash if Sentry not installed).
  // Only report unexpected/programmer errors — routine operational errors
  // (validation failures, invalid OTP, etc.) would otherwise flood Sentry.
  try {
    const Sentry = require("@sentry/node");
    if (Sentry && process.env.SENTRY_DSN && !error.isOperational) {
      Sentry.captureException(err);
    }
  } catch (_) {
    // ignore if Sentry not installed
  }

  sendError(error, res);
};

module.exports = errorMiddleware;
