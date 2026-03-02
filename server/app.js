require('dotenv').config();
const express      = require('express');
const cookieParser = require('cookie-parser');
const cors         = require('cors');

const connectDB    = require('./src/config/db');

// ── Security Middleware ───────────────────────────────────
const {
  helmetMiddleware,
  sanitizeMiddleware,
  hppMiddleware,
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
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parsers ──────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// body parse ke baad sanitize/hpp
app.use(sanitizeMiddleware);
app.use(hppMiddleware);

// ── Request Logger (dev) ──────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`📌 ${req.method} ${req.url}`);
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

// ── 404 Handler ───────────────────────────────────────────
app.use((req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404));
});

// ── Global Error Handler ──────────────────────────────────
app.use(errorMiddleware);

module.exports = app;