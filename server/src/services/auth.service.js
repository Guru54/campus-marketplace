const bcrypt       = require("bcryptjs");
const jwt          = require("jsonwebtoken");
const User         = require("../models/User");
const College      = require("../models/College");
const AuditLog     = require("../models/AuditLog");
const generateOTP  = require("../utils/generateOtp");
const sendOTPEmail = require("../utils/sendOtpEmail");
const AppError     = require("../utils/AppError");

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS   = 15 * 60 * 1000; // 15 minutes

// ── Helpers ────────────────────────────────────────────────
const signToken = (user) =>
  jwt.sign(
    { userId: user._id, role: user.role, college: user.college },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

const formatUser = (user) => ({
  _id:       user._id,
  firstName: user.firstName,
  lastName:  user.lastName,
  email:     user.email,
  role:      user.role,
  college:   user.college,
  avatar:    user.avatar,
  avatarUrl: user.avatarUrl,
});

// ─────────────────────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────────────────────
const register = async (data, ip) => {
  const { firstName, lastName, email, password, collegeId } = data;

  // ── 1. College ───────────────────────────────────────────
  const college = await College.findById(collegeId);
  if (!college)          throw new AppError("Invalid college selected", 400);
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
      const otp       = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      existingUser.otp       = otp;
      existingUser.otpExpiry = otpExpiry;
      await existingUser.save();
      await sendOTPEmail(email, existingUser.firstName, otp);

      return { resent: true };
    }
    throw new AppError("Email already registered", 400);
  }

  // ── 4. Create user ───────────────────────────────────────
  const hashedPassword = await bcrypt.hash(password, 12);
  const otp            = generateOTP();
  const otpExpiry      = new Date(Date.now() + 10 * 60 * 1000);

  const user = await User.create({
    firstName, lastName, email,
    password: hashedPassword,
    college:  collegeId,
    otp, otpExpiry,
  });

  await sendOTPEmail(email, firstName, otp);

  // ── 5. Audit ─────────────────────────────────────────────
  await AuditLog.create({ action: "REGISTER", user: user._id, ip });

  return { userId: user._id };
};

// ─────────────────────────────────────────────────────────────
// Verify OTP
// ─────────────────────────────────────────────────────────────
const verifyOTP = async (data, ip) => {
  const { email, otp } = data;

  const user = await User.findOne({ email }).select("+otp +otpExpiry");

  if (!user)           throw new AppError("User not found", 404);
  if (user.isVerified) throw new AppError("Email already verified", 400);

  if (!user.otp || !user.otpExpiry || user.otpExpiry < Date.now())
    throw new AppError("OTP expired. Please register again.", 400);

  if (user.otp !== otp)
    throw new AppError("Invalid OTP", 400);

  user.isVerified = true;
  user.otp        = null;
  user.otpExpiry  = null;
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
    "+password +loginAttempts +lockUntil"
  );

  if (!user) throw new AppError("Invalid credentials", 401);

  // ── Account lock check ───────────────────────────────────
  if (user.isLocked()) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60_000);
    throw new AppError(
      `Account locked. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`,
      423
    );
  }

  if (!user.isVerified)
    throw new AppError("Please verify your email first", 401);

  // ── Password check ───────────────────────────────────────
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    user.loginAttempts += 1;

    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil     = new Date(Date.now() + LOCK_DURATION_MS);
      user.loginAttempts = 0;
      await user.save();

      await AuditLog.create({ action: "ACCOUNT_LOCKED", user: user._id, ip });
      throw new AppError(
        "Too many failed attempts. Account locked for 15 minutes.",
        423
      );
    }

    await user.save();
    const remaining = MAX_LOGIN_ATTEMPTS - user.loginAttempts;
    throw new AppError(
      `Invalid credentials. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
      401
    );
  }

  // ── Success → reset lock ─────────────────────────────────
  user.loginAttempts = 0;
  user.lockUntil     = null;
  await user.save();

  await AuditLog.create({ action: "LOGIN", user: user._id, ip });

  const token = signToken(user);
  return { token, user: formatUser(user) };
};

module.exports = { register, verifyOTP, login };
