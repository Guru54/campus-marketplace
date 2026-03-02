const http        = require("http");
const app         = require("./app");
const initSocket  = require("./src/socket/index");

const PORT   = process.env.PORT || 5000;
const server = http.createServer(app);

// ── Socket.io ──────────────────────────────────────────
const io = initSocket(server);

// Make io accessible in req (for controllers that need to emit)
app.set("io", io);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  console.log(`🔌 Socket.io ready`);
});

// ── Graceful Shutdown ─────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n${signal} received. Closing server...`);
  server.close(() => {
    console.log("✅ HTTP server closed.");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("❌ Forced shutdown.");
    process.exit(1);
  }, 10_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err.message);
  shutdown("unhandledRejection");
});