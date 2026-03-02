const crypto = require("crypto");

/**
 * Generates a secure 6-digit OTP
 * Uses crypto instead of Math.random() → cryptographically safe
 */
const generateOTP = () => {
  // Random number between 100000 - 999999
  const otp = crypto.randomInt(100000, 999999).toString();
  return otp;
};

module.exports = generateOTP;