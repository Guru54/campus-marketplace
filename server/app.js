// 1. Core Dependencies
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet'); // Optional but highly recommended for security

// 2. Database & Config Imports
const connectDB = require('./src/Config/db');

// 3. Initialize App & Database
const app = express();
connectDB();

// 4. Global Middleware
app.use(helmet()); // Sets secure HTTP headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true // ✅ Essential for JWT Cookies
}));
app.use(express.json()); // Parses incoming JSON
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded bodies
app.use(cookieParser()); // Parses cookies for Auth

// 5. Routes
app.get('/', (req, res) => {
    res.send("API is running...");
});

// app.use('/api/v1/users', require('./src/Routes/userRoutes'));

// 6. Global Error Handler (Keep this at the very bottom)
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

module.exports = app;
