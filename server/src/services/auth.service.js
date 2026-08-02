const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const College = require("../models/College");
const AuditLog = require("../models/AuditLog");
const generateOTP = require("../utils/generateOtp");
const sendOTPEmail = require("../utils/sendOtpEmail");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MAX_OTP_ATTEMPTS = 5;

// Any valid bcrypt hash — compared against on every login for a
// nonexistent user so response timing can't reveal whether an
// email is registered (bcrypt.compare against a real hash is
// deliberately slow; skipping it entirely for unknown users would
// make "no such account" responses measurably faster).
const DUMMY_HASH =
  "$2a$12$CwTycUXWue0Thq9StjUM0uJ8O.9nA8n0jrxYtC6z9nfE0.hbT5aQm";

// ── Helpers ────────────────────────────────────────────────
const signToken = (user) =>
  jwt.sign(
    { userId: user._id, role: user.role, college: user.college },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

const formatUser = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  college: user.college,
  avatar: user.avatar,
  avatarUrl: user.avatarUrl,
});

// OTPs are short-lived and single-use, so a fast hash (rather than
// bcrypt) is sufficient — this just protects against DB-dump exposure.
const hashOTP = (otp) =>
  crypto.createHash("sha256").update(String(otp)).digest("hex");

const otpsMatch = (storedHash, candidateOtp) => {
  if (!storedHash) return false;
  const candidateHash = hashOTP(candidateOtp);
  const a = Buffer.from(storedHash);
  const b = Buffer.from(candidateHash);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

// ─────────────────────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────────────────────
const register = async (data, ip) => {
  const { firstName, lastName, email, password, collegeId } = data;

  // ── 1. College ───────────────────────────────────────────
  const college = await College.findById(collegeId);
  if (!college) throw new AppError("Invalid college selected", 400);
  if (!college.isActive) throw new AppError("College is not active", 400);

  // ── 2. Domain ───────────────────────────────────────────
  if (process.env.NODE_ENV !== "development") {
    const emailDomain = email.split("@")[1]?.toLowerCase();
    if (emailDomain !== college.domain)
      throw new AppError(`Please use your official ${college.name} email`, 400);
  }

  // ── 3. Duplicate ────────────────────────────────────────
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (!existingUser.isVerified) {
      // Resend OTP to unverified existing user
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      existingUser.otp = hashOTP(otp);
      existingUser.otpExpiry = otpExpiry;
      existingUser.otpAttempts = 0;
      await existingUser.save();

      try {
        await sendOTPEmail(email, existingUser.firstName, otp);
      } catch (err) {
        logger.error("Resend OTP failed:", err.message);
      }

      return { resent: true };
    }
    throw new AppError("Email already registered", 400);
  }

  // ── 4. Create user ───────────────────────────────────────
  const hashedPassword = await bcrypt.hash(password, 12);
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    college: collegeId,
    otp: hashOTP(otp),
    otpExpiry,
  });

  try {
    await sendOTPEmail(email, firstName, otp);
  } catch (err) {
    logger.error("OTP email failed:", err.message);
  }

  // ── 5. Audit ─────────────────────────────────────────────
  await AuditLog.create({ action: "REGISTER", user: user._id, ip });

  return { userId: user._id };
};

// ─────────────────────────────────────────────────────────────
// Verify OTP
// ─────────────────────────────────────────────────────────────
const verifyOTP = async (data, ip) => {
  const { email, otp } = data;

  const user = await User.findOne({ email }).select(
    "+otp +otpExpiry +otpAttempts",
  );

  if (!user) throw new AppError("User not found", 404);
  if (user.isVerified) throw new AppError("Email already verified", 400);

  if (!user.otp || !user.otpExpiry || user.otpExpiry < Date.now())
    throw new AppError("OTP expired. Please register again.", 400);

  if (!otpsMatch(user.otp, otp)) {
    user.otpAttempts = (user.otpAttempts || 0) + 1;

    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      user.otp = null;
      user.otpExpiry = null;
      user.otpAttempts = 0;
      await user.save();
      throw new AppError(
        "Too many incorrect attempts. Please request a new OTP.",
        429,
      );
    }

    await user.save();
    throw new AppError("Invalid OTP", 400);
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;
  user.otpAttempts = 0;
  await user.save();

  await AuditLog.create({ action: "VERIFY_OTP", user: user._id, ip });

  const token = signToken(user);
  return { token, user: formatUser(user) };
};

// ─────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────
const login = async (data, ip) => {
  const { email, password } = data;

  const user = await User.findOne({ email }).select(
    "+password +loginAttempts +lockUntil",
  );

  if (!user) {
    // Burn roughly the same time a real bcrypt.compare would take,
    // so response timing doesn't reveal whether this email exists.
    await bcrypt.compare(password, DUMMY_HASH);
    throw new AppError("Invalid credentials", 401);
  }

  // ── Account lock check ───────────────────────────────────
  if (user.isLocked()) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60_000);
    throw new AppError(
      `Account locked. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`,
      423,
    );
  }

  if (!user.isVerified)
    throw new AppError("Please verify your email first", 401);

  if (user.isBanned)
    throw new AppError(
      "This account has been suspended. Contact support.",
      403,
    );

  // ── Password check ───────────────────────────────────────
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    user.loginAttempts += 1;

    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
      user.loginAttempts = 0;
      await user.save();

      await AuditLog.create({ action: "ACCOUNT_LOCKED", user: user._id, ip });
      throw new AppError(
        "Too many failed attempts. Account locked for 15 minutes.",
        423,
      );
    }

    await user.save();
    const remaining = MAX_LOGIN_ATTEMPTS - user.loginAttempts;
    throw new AppError(
      `Invalid credentials. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
      401,
    );
  }

  // ── Success → reset lock ─────────────────────────────────
  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  await AuditLog.create({ action: "LOGIN", user: user._id, ip });

  const token = signToken(user);
  return { token, user: formatUser(user) };
};

// ─────────────────────────────────────────────────────────────
// Resend OTP — dedicated endpoint (register() already resends
// implicitly for unverified duplicates; this lets the frontend's
// "Resend OTP" button call it directly without resubmitting the
// whole registration form).
// ─────────────────────────────────────────────────────────────
const resendOTP = async (data, ip) => {
  const { email } = data;

  const user = await User.findOne({ email });
  if (!user) throw new AppError("No account found for this email", 404);
  if (user.isVerified) throw new AppError("Email is already verified", 400);

  const otp = generateOTP();
  user.otp = hashOTP(otp);
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  user.otpAttempts = 0;
  await user.save();

  try {
    await sendOTPEmail(email, user.firstName, otp);
  } catch (err) {
    logger.error("Resend OTP failed:", err.message);
  }

  await AuditLog.create({ action: "RESEND_OTP", user: user._id, ip });

  return { resent: true };
};

// ─────────────────────────────────────────────────────────────
// Forgot Password — request a reset OTP
// Always returns the same generic result whether or not the
// email exists / is verified, so this endpoint can't be used to
// enumerate registered accounts.
// ─────────────────────────────────────────────────────────────
const forgotPassword = async (data, ip) => {
  const { email } = data;
  const GENERIC_RESULT = {
    message: "If that account exists, a reset code has been sent.",
  };

  const user = await User.findOne({ email });
  if (!user || !user.isVerified) return GENERIC_RESULT;

  const otp = generateOTP();
  user.otp = hashOTP(otp);
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  user.otpAttempts = 0;
  await user.save();

  try {
    await sendOTPEmail(email, user.firstName, otp, "reset");
  } catch (err) {
    logger.error("Password reset OTP email failed:", err.message);
  }

  await AuditLog.create({
    action: "FORGOT_PASSWORD_REQUEST",
    user: user._id,
    ip,
  });

  return GENERIC_RESULT;
};

// ─────────────────────────────────────────────────────────────
// Reset Password — consume the OTP from forgotPassword and set
// a new password. Also invalidates any JWTs issued before this
// moment (see authMiddleware.protect's passwordChangedAt check).
// ─────────────────────────────────────────────────────────────
const resetPassword = async (data, ip) => {
  const { email, otp, newPassword } = data;

  const user = await User.findOne({ email }).select(
    "+otp +otpExpiry +otpAttempts",
  );
  if (!user) throw new AppError("Invalid or expired reset code", 400);

  if (!user.otp || !user.otpExpiry || user.otpExpiry < Date.now())
    throw new AppError("Invalid or expired reset code", 400);

  if (!otpsMatch(user.otp, otp)) {
    user.otpAttempts = (user.otpAttempts || 0) + 1;

    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      user.otp = null;
      user.otpExpiry = null;
      user.otpAttempts = 0;
      await user.save();
      throw new AppError(
        "Too many incorrect attempts. Please request a new reset code.",
        429,
      );
    }

    await user.save();
    throw new AppError("Invalid or expired reset code", 400);
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.otp = null;
  user.otpExpiry = null;
  user.otpAttempts = 0;
  user.passwordChangedAt = new Date();
  // A reset is also a good moment to clear any stale lockout
  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  await AuditLog.create({ action: "RESET_PASSWORD", user: user._id, ip });

  // Don't hand a banned user a working session token — resetPassword
  // auto-logs the user in, and login() itself blocks banned accounts,
  // so this keeps the two paths consistent.
  if (user.isBanned) {
    return {
      token: null,
      user: null,
      message: "Password reset, but this account is suspended.",
    };
  }

  const token = signToken(user);
  return { token, user: formatUser(user) };
};

module.exports = {
  register,
  verifyOTP,
  login,
  resendOTP,
  forgotPassword,
  resetPassword,
};
