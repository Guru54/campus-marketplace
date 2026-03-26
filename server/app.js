require('dotenv').config();
const express      = require('express');
const cookieParser = require('cookie-parser');
const cors         = require('cors');

const connectDB    = require('./src/config/db');

// ── Security Middleware ───────────────────────────────────
const {
  helmetMiddleware,
  sanitizeMiddleware,
} = require('./src/middleware/securityMiddleware');

// ── Error Handler ─────────────────────────────────────────
const errorMiddleware = require('./src/middleware/errorMiddleware');
const AppError        = require('./src/utils/AppError');

// ── Routes ────────────────────────────────────────────────
const authRoutes    = require('./src/routes/authRoutes');
const listingRoutes = require('./src/routes/listingRoutes');
const userRoutes    = require('./src/routes/userRoutes');
const chatRoutes    = require('./src/routes/chatRoutes');
const app = express();
connectDB();

// ── Security ──────────────────────────────────────────────
app.use(helmetMiddleware);     // secure HTTP headers

// ── CORS ──────────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .concat(['http://localhost:5174', 'http://localhost:5175']); // Vite fallback ports

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, mobile, Postman)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parsers ──────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// body parse ke baad sanitize
app.use(sanitizeMiddleware);

// ── Request Logger (dev) ──────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const logger = require('./src/utils/logger');
  app.use((req, res, next) => {
    logger.log(`📌 ${req.method} ${req.url}`);
    next();
  });
}

// ── Health Check ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────
app.use('/api/v1/auth',     authRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/users',    userRoutes);
app.use('/api/v1/chats',    chatRoutes);
app.get("/debug-sentry", (req, res) => {
  throw new Error("Sentry test error — delete this route!");
});
// ── 404 Handler ───────────────────────────────────────────
app.use((req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404));
});

// ── Global Error Handler ──────────────────────────────────
app.use(errorMiddleware);

module.exports = app;