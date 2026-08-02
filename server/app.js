require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// NOTE: connectDB() is intentionally NOT called here — it is awaited in
// server.js before the server starts listening, so the app never accepts
// traffic before the DB connection is confirmed. app.js only builds and
// exports the Express app (useful for tests too, which import app.js
// without needing a live DB).

// ── Security Middleware ───────────────────────────────────
const {
  helmetMiddleware,
  sanitizeMiddleware,
  globalLimiter,
} = require("./src/middleware/securityMiddleware");

// ── Error Handler ─────────────────────────────────────────
const errorMiddleware = require("./src/middleware/errorMiddleware");
const AppError = require("./src/utils/AppError");
const logger = require("./src/utils/logger");

// ── Routes ────────────────────────────────────────────────
const authRoutes = require("./src/routes/authRoutes");
const listingRoutes = require("./src/routes/listingRoutes");
const userRoutes = require("./src/routes/userRoutes");
const chatRoutes = require("./src/routes/chatRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const app = express();

// ── Security ──────────────────────────────────────────────
app.use(helmetMiddleware); // secure HTTP headers
app.set('trust proxy', 1);
// ── CORS ──────────────────────────────────────────────────
// Localhost dev ports are only appended outside production, so a
// production deployment can never be bypassed via a spoofed
// "http://localhost:xxxx" Origin header.
const ALLOWED_ORIGINS = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

if (process.env.NODE_ENV !== "production") {
  ALLOWED_ORIGINS.push(
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
  );
}

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, mobile, Postman)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      // Log server-side only — don't reflect arbitrary input back in the error
      logger.error(`CORS blocked request from origin: ${origin}`);
      cb(new AppError("CORS: this origin is not allowed", 403));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ── Body Parsers ──────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// body parse ke baad sanitize
app.use(sanitizeMiddleware);

// ── Request Logger (dev) ──────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  const logger = require("./src/utils/logger");
  app.use((req, res, next) => {
    logger.log(`📌 ${req.method} ${req.url}`);
    next();
  });
}

// ── Health Check ──────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────
app.use("/api/", globalLimiter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/listings", listingRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/chats", chatRoutes);
app.use("/api/v1/admin", adminRoutes);

// ── 404 Handler ───────────────────────────────────────────
app.use((req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404));
});

// ── Global Error Handler ──────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
