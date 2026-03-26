const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── Verify connection on startup ───────────────────────────
transporter.verify((error) => {
  const logger = require('../utils/logger');
  if (error) {
    console.error("Email transporter error:", error.message);
  } else {
    logger.log("Email transporter ready");
  }
});

module.exports = transporter;