const http = require("http");
const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./src/config/db");
const logger = require("./src/utils/logger");

// Optional Sentry integration (safe require)
let Sentry;
try {
  Sentry = require("@sentry/node");
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    enabled: process.env.NODE_ENV === "production", // Only enable in production
  });
  if (process.env.NODE_ENV === "production" && !process.env.SENTRY_DSN) {
    console.warn(
      "⚠️  SENTRY_DSN not set — error tracking disabled in production.",
    );
  }
} catch (e) {
  console.error("Failed to initialize Sentry:", e);
  // Sentry not installed or failed to init — continue without it
}

const initSocket = require("./src/socket/index");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// socket.io setup
const io = initSocket(server);

// Make io accessible in req (for controllers that need to emit)
app.set("io", io);

// ── Graceful shutdown ──────────────────────────────────────
const shutdown = (signal) => {
  logger.log(`\n${signal} received. Closing server...`);

  io.close(() => logger.log("Socket.io closed."));

  server.close(async () => {
    logger.log("HTTP server closed.");
    try {
      await mongoose.connection.close();
      logger.log("DB connection closed.");
    } catch (e) {
      console.error("Error closing DB connection:", e.message);
    }
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Forced shutdown.");
    process.exit(1);
  }, 10_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  if (Sentry) Sentry.captureException(err);
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  if (Sentry) Sentry.captureException(err);
  shutdown("uncaughtException");
});

// ── Start server only after DB connects ────────────────────
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      logger.log(
        `Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`,
      );
      logger.log(`Socket.io ready`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to DB:", err.message);
    process.exit(1);
  });
