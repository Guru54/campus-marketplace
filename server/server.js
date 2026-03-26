const http        = require("http");
const app         = require("./app");
// Optional Sentry integration (safe require)
let Sentry;
try {
  Sentry = require('@sentry/node');
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    enabled: process.env.NODE_ENV === 'production', // Only enable in production
     // Enable debug to see Sentry logs in console
  });
} catch (e) {
  console.error("Failed to initialize Sentry:", e);
  // Sentry not installed or failed to init — continue without it
}

const initSocket  = require("./src/socket/index");

const PORT   = process.env.PORT || 5000;
const server = http.createServer(app);
const logger = require('./src/utils/logger');

// socket.io setup
const io = initSocket(server);

// Make io accessible in req (for controllers that need to emit)
app.set("io", io);

server.listen(PORT, () => {
  logger.log(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  logger.log(`Socket.io ready`);
});

// Graceful shutdown
const shutdown = (signal) => {
  logger.log(`\n${signal} received. Closing server...`);
  server.close(() => {
    logger.log("HTTP server closed.");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("Forced shutdown.");
    process.exit(1);
  }, 10_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
   if (Sentry) Sentry.captureException(err);
  shutdown("unhandledRejection");
});